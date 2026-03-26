"use strict";

import "adaptive-extender/core";
import { TelegramClient, FileLocation } from "@mtcute/web";

//#region Telegram media
export interface MediaRange {
	start: number;
	end: number;
	total: number;
}

export interface TelegramMediaDownloadResult {
	stream: ReadableStream<Uint8Array>;
	completion: Promise<void>;
}

export class TelegramMedia {
	#mimeType: string;
	#fileSize: number;
	#client: TelegramClient;
	#media: FileLocation;

	constructor(mimeType: string, fileSize: number, client: TelegramClient, media: FileLocation) {
		this.#mimeType = mimeType;
		this.#fileSize = fileSize;
		this.#client = client;
		this.#media = media;
	}

	get mimeType(): string {
		return this.#mimeType;
	}

	get fileSize(): number {
		return this.#fileSize;
	}

	#alignment(): number {
		return (this.#fileSize !== Number.POSITIVE_INFINITY && this.#fileSize >= 1_048_576) ? 131_072 : 4_096;
	}

	download(offset: number = 0, limit: number = Number.POSITIVE_INFINITY): TelegramMediaDownloadResult {
		const alignment = this.#alignment();
		const alignedOffset = Math.floor(offset / alignment) * alignment;
		const skip = offset - alignedOffset;

		let resolveCompletion!: () => void;
		const completion = new Promise<void>(resolve => { resolveCompletion = resolve; });

		const upstream = this.#client.downloadAsStream(this.#media, { offset: alignedOffset });
		const upstreamReader = upstream.getReader();

		let skipped = 0;
		let forwarded = 0;
		let cancelled = false;

		const stream = new ReadableStream<Uint8Array>({
			async pull(controller): Promise<void> {
				if (cancelled) return;
				try {
					while (true) {
						const { done, value } = await upstreamReader.read();
						if (cancelled) return;
						if (done) {
							controller.close();
							resolveCompletion();
							return;
						}

						let chunk: Uint8Array = value;

						if (skipped < skip) {
							const toSkip = Math.min(skip - skipped, chunk.length);
							skipped += toSkip;
							chunk = chunk.subarray(toSkip);
							if (chunk.length === 0) continue;
						}

						if (limit !== Number.POSITIVE_INFINITY) {
							const remaining = limit - forwarded;
							if (remaining <= 0) {
								controller.close();
								resolveCompletion();
								return;
							}
							if (chunk.length > remaining) chunk = chunk.subarray(0, remaining);
						}

						controller.enqueue(chunk);
						forwarded += chunk.length;

						if (limit !== Number.POSITIVE_INFINITY && forwarded >= limit) {
							controller.close();
							resolveCompletion();
						}
						return;
					}
				} catch (reason) {
					if (!cancelled) controller.error(reason);
					resolveCompletion();
				}
			},
			async cancel(reason): Promise<void> {
				cancelled = true;
				try { await upstreamReader.cancel(reason); }
				catch (cancelError) { console.error("Reader cancellation failed:", cancelError); }
				resolveCompletion();
			}
		});

		return { stream, completion };
	}
}
//#endregion
