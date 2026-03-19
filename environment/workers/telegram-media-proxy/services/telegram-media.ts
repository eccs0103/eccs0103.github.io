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

	// Telegram requires offset to be aligned to the file's internal chunk size.
	// Files < 1 MB use 4 096-byte chunks; files >= 1 MB use 131 072-byte (128 KB) chunks.
	#alignment(): number {
		return (this.#fileSize !== undefined && this.#fileSize >= 1_048_576) ? 131_072 : 4_096;
	}

	#trim(upstream: ReadableStream<Uint8Array>, skip: number, limit: number | undefined): ReadableStream<Uint8Array> {
		let skipped = 0;
		let forwarded = 0;
		let exhausted = false;
		return upstream.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
			transform(raw, controller): void {
				if (exhausted) return;
				let chunk = raw;
				if (skipped < skip) {
					const toSkip = Math.min(skip - skipped, chunk.length);
					skipped += toSkip;
					chunk = chunk.subarray(toSkip);
					if (chunk.length === 0) return;
				}
				if (limit !== undefined) {
					const remaining = limit - forwarded;
					if (remaining <= 0) { exhausted = true; controller.terminate(); return; }
					if (chunk.length > remaining) chunk = chunk.subarray(0, remaining);
				}
				controller.enqueue(chunk);
				forwarded += chunk.length;
				if (limit !== undefined && forwarded >= limit) { exhausted = true; controller.terminate(); }
			},
		}));
	}

	async #pipe(source: ReadableStream<Uint8Array>, writable: WritableStream<Uint8Array>, alignedOffset: number): Promise<void> {
		const reader = source.getReader();
		const writer = writable.getWriter();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				await writer.write(value);
			}
			await writer.close();
		} catch (reason) {
			console.error(`Telegram download error (offset=${alignedOffset}): ${Error.from(reason).message}`);
			try { await reader.cancel(); } catch { /* ignore */ }
			try { await writer.close(); } catch { /* ignore */ }
		} finally {
			reader.releaseLock();
			writer.releaseLock();
		}
	}

	download(options: Partial<TelegramMediaDownloadOptions> = {}): TelegramMediaDownloadResult {
		const { offset = 0, limit } = options;
		const alignment = this.#alignment();
		const alignedOffset = Math.floor(offset / alignment) * alignment;
		const skip = offset - alignedOffset;

		const upstream = this.#client.downloadAsStream(this.#media, { offset: alignedOffset });
		const source = (skip > 0 || limit !== undefined) ? this.#trim(upstream, skip, limit) : upstream;

		const relay = new TransformStream<Uint8Array, Uint8Array>();
		const done = this.#pipe(source, relay.writable, alignedOffset);
		return { stream: relay.readable, done };
	}
}
//#endregion
