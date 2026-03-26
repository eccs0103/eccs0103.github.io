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

	#trim(upstream: ReadableStream<Uint8Array>, skip: number, limit: number): ReadableStream<Uint8Array> {
		let skipped = 0;
		let forwarded = 0;
		let exhausted = false;
		return upstream.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
			transform(rawChunk, controller): void {
				if (exhausted) return;
				let chunk = rawChunk;
				if (skipped < skip) {
					const toSkip = Math.min(skip - skipped, chunk.length);
					skipped += toSkip;
					chunk = chunk.subarray(toSkip);
					if (chunk.length === 0) return;
				}
				if (limit !== Number.POSITIVE_INFINITY) {
					const remaining = limit - forwarded;
					if (remaining <= 0) { exhausted = true; controller.terminate(); return; }
					if (chunk.length > remaining) chunk = chunk.subarray(0, remaining);
				}
				controller.enqueue(chunk);
				forwarded += chunk.length;
				if (limit !== Number.POSITIVE_INFINITY && forwarded >= limit) { exhausted = true; controller.terminate(); }
			},
		}));
	}

	async #cancelStream(reader: ReadableStreamDefaultReader): Promise<void> {
		try { await reader.cancel(); }
		catch (cancelError) { console.error("Reader cancellation failed:", cancelError); }
	}

	async #closeStream(writer: WritableStreamDefaultWriter): Promise<void> {
		try { await writer.close(); }
		catch (closeError) { console.error("Writer close failed:", closeError); }
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
			const error = reason instanceof Error ? reason : new Error(String(reason));
			console.error(`Telegram download error (offset=${alignedOffset}): ${error.message}`);
			await this.#cancelStream(reader);
			await this.#closeStream(writer);
		} finally {
			reader.releaseLock();
			writer.releaseLock();
		}
	}

	download(offset: number = 0, limit: number = Number.POSITIVE_INFINITY): TelegramMediaDownloadResult {
		const alignment = this.#alignment();
		const alignedOffset = Math.floor(offset / alignment) * alignment;
		const skip = offset - alignedOffset;

		const upstream = this.#client.downloadAsStream(this.#media, { offset: alignedOffset });
		const source = (skip > 0 || limit !== Number.POSITIVE_INFINITY) ? this.#trim(upstream, skip, limit) : upstream;

		const relay = new TransformStream<Uint8Array, Uint8Array>();
		const completion = this.#pipe(source, relay.writable, alignedOffset);
		return { stream: relay.readable, completion };
	}
}
//#endregion
