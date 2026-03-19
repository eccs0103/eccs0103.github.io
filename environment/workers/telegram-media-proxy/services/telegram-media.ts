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
		// Pass only the byte offset to mtcute; limit is enforced manually below.
		// Telegram chunks are typically 128 KB, and mtcute may not support sub-chunk limits.
		const upstream = this.#client.downloadAsStream(this.#media, { offset });
		const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();

		let source: ReadableStream<Uint8Array>;
		if (limit !== undefined && limit > 0) {
			let remaining = limit;
			source = upstream.pipeThrough(
				new TransformStream<Uint8Array, Uint8Array>({
					transform(chunk, controller) {
						if (remaining <= 0) return;
						if (chunk.length <= remaining) {
							controller.enqueue(chunk);
							remaining -= chunk.length;
							if (remaining === 0) controller.terminate();
						} else {
							controller.enqueue(chunk.subarray(0, remaining));
							remaining = 0;
							controller.terminate();
						}
					},
				}),
			);
		} else {
			source = upstream;
		}

		const done: Promise<void> = source.pipeTo(writable).then(() => {}, () => {});
		return { stream: readable, done };
	}
}
//#endregion
