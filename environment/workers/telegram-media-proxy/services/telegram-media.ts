"use strict";

import "adaptive-extender/core";
import { TelegramClient, FileLocation } from "@mtcute/web";

//#region Telegram media
export interface TelegramMediaDownloadOptions {
	offset: number;
	limit: number;
}

export interface MediaRange {
	start: number;
	end: number | undefined;
	total: number | undefined;
}

export interface TelegramMediaDownloadResult {
	stream: ReadableStream<Uint8Array>;
	done: Promise<void>;
}

export class TelegramMedia {
	#mimeType: string;
	#fileSize: number | undefined;
	#client: TelegramClient;
	#media: FileLocation;

	constructor(mimeType: string, fileSize: number | undefined, client: TelegramClient, media: FileLocation) {
		this.#mimeType = mimeType;
		this.#fileSize = fileSize;
		this.#client = client;
		this.#media = media;
	}

	get mimeType(): string {
		return this.#mimeType;
	}

	get fileSize(): number | undefined {
		return this.#fileSize;
	}

	download(options: Partial<TelegramMediaDownloadOptions> = {}): TelegramMediaDownloadResult {
		const { offset = 0, limit } = options;
		// Telegram requires offset to be aligned to the file's internal chunk size.
		// Files < 1 MB use 4 096-byte chunks; files >= 1 MB use 131 072-byte (128 KB) chunks.
		const alignment = (this.#fileSize !== undefined && this.#fileSize >= 1_048_576) ? 131_072 : 4_096;
		const alignedOffset = Math.floor(offset / alignment) * alignment;
		const skip = offset - alignedOffset;

		const upstream = this.#client.downloadAsStream(this.#media, { offset: alignedOffset });

		let source: ReadableStream<Uint8Array>;
		if (skip > 0 || limit !== undefined) {
			let skipped = 0;
			let forwarded = 0;
			let terminated = false;
			source = upstream.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
				transform(raw, controller) {
					if (terminated) return;
					let chunk = raw;
					if (skipped < skip) {
						const toSkip = Math.min(skip - skipped, chunk.length);
						skipped += toSkip;
						chunk = chunk.subarray(toSkip);
						if (chunk.length === 0) return;
					}
					if (limit !== undefined) {
						const remaining = limit - forwarded;
						if (remaining <= 0) { terminated = true; controller.terminate(); return; }
						if (chunk.length > remaining) chunk = chunk.subarray(0, remaining);
					}
					controller.enqueue(chunk);
					forwarded += chunk.length;
					if (limit !== undefined && forwarded >= limit) { terminated = true; controller.terminate(); }
				},
			}));
		} else {
			source = upstream;
		}

		// Manual pipe with graceful error handling: if the upstream errors (e.g. a Telegram API
		// error mid-stream), close the writable side normally so the CF runtime does not mark
		// the response body as errored (which would show as "Exception Thrown" in wrangler tail).
		const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
		const done = new Promise<void>(resolve => {
			const reader = source.getReader();
			const writer = writable.getWriter();
			(async () => {
				try {
					while (true) {
						const { done: isDone, value } = await reader.read();
						if (isDone) break;
						if (value !== undefined) await writer.write(value);
					}
					await writer.close();
				} catch (reason) {
					console.error(`Telegram download error (offset=${alignedOffset}): ${Error.from(reason).message}`);
					// Cancel the source so mtcute workers receive an abort signal and stop
					// cleanly before the channel is disconnected, preventing a stack overflow.
					await reader.cancel().catch(() => {});
					await writer.close().catch(() => {});
				} finally {
					reader.releaseLock();
					writer.releaseLock();
					resolve();
				}
			})();
		});
		return { stream: readable, done };
	}
}
//#endregion
