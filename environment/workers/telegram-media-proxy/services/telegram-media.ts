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
		const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();

		let source: ReadableStream<Uint8Array>;
		if (skip > 0 || limit !== undefined) {
			let skipped = 0;
			let forwarded = 0;
			source = upstream.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
				transform(raw, controller) {
					let chunk = raw;
					if (skipped < skip) {
						const toSkip = Math.min(skip - skipped, chunk.length);
						skipped += toSkip;
						chunk = chunk.subarray(toSkip);
						if (chunk.length === 0) return;
					}
					if (limit !== undefined) {
						const remaining = limit - forwarded;
						if (remaining <= 0) { controller.terminate(); return; }
						if (chunk.length > remaining) chunk = chunk.subarray(0, remaining);
					}
					controller.enqueue(chunk);
					forwarded += chunk.length;
					if (limit !== undefined && forwarded >= limit) controller.terminate();
				},
			}));
		} else {
			source = upstream;
		}

		const done: Promise<void> = source.pipeTo(writable).then(() => { }, () => { });
		return { stream: readable, done };
	}
}
//#endregion
