"use strict";

import "adaptive-extender/core";
import { TelegramClient, FileLocation } from "@mtcute/web";

//#region Telegram media
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

	download(offset: number = 0, limit?: number): ReadableStream<Uint8Array> {
		const alignedOffset = Math.floor(offset / 4096) * 4096;
		const prefixSkip = offset - alignedOffset;
		const params: { offset?: number; limit?: number } = {};
		if (alignedOffset > 0) params.offset = alignedOffset;
		if (limit !== undefined) params.limit = prefixSkip + limit;

		const upstream = this.#client.downloadAsStream(this.#media, params);
		const client = this.#client;
		let disposed = false;
		const disposeOnce = (): void => {
			if (!disposed) { disposed = true; void client.disconnect(); }
		};

		return new ReadableStream<Uint8Array>({
			start(controller: ReadableStreamDefaultController<Uint8Array>): void {
				const reader = upstream.getReader();
				let skipped = 0;
				let written = 0;
				(async (): Promise<void> => {
					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;
							let chunk = value;
							if (skipped < prefixSkip) {
								const skip = Math.min(prefixSkip - skipped, chunk.length);
								skipped += skip;
								if (skip === chunk.length) continue;
								chunk = chunk.subarray(skip);
							}
							if (limit !== undefined) {
								const remaining = limit - written;
								if (remaining <= 0) break;
								if (chunk.length > remaining) chunk = chunk.subarray(0, remaining);
							}
							controller.enqueue(chunk);
							written += chunk.length;
							if (limit !== undefined && written >= limit) break;
						}
						controller.close();
					} catch (err) {
						controller.error(err);
					} finally {
						reader.releaseLock();
						disposeOnce();
					}
				})();
			},
			cancel(): void { disposeOnce(); },
		});
	}

	dispose(): void {
		void this.#client.disconnect();
	}
}
//#endregion
