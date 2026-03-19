"use strict";

import "adaptive-extender/core";
import { TelegramChannel } from "./telegram-channel.js";
import { type MediaRange, type TelegramMediaDownloadResult } from "./telegram-media.js";
import { type ResponseFactory } from "./response-factory.js";

//#region Media proxy
export class MediaProxy {
	static #IDENTIFIER_PATTERN: RegExp = /^\d{1,15}$/;
	#channel: TelegramChannel;
	#factory: ResponseFactory;

	constructor(channel: TelegramChannel, factory: ResponseFactory) {
		this.#channel = channel;
		this.#factory = factory;
	}

	static #parseRange(header: string, totalSize: number | undefined): MediaRange | 416 | null {
		const match = /^bytes=(\d+)-(\d*)$/.exec(header);
		if (match === null) return null; // multi-range or unparseable → ignore, serve full
		const [, startStr, endStr] = match;
		const start = Number.parseInt(startStr, 10);
		if (totalSize !== undefined && start >= totalSize) return 416;
		if (endStr === "") return { start, end: totalSize !== undefined ? totalSize - 1 : undefined, total: totalSize };
		const end = Number.parseInt(endStr, 10);
		if (end < start) return 416;
		const actualEnd = totalSize !== undefined ? Math.min(end, totalSize - 1) : end;
		return { start, end: actualEnd, total: totalSize };
	}

	#scheduleDisconnect(context: ExecutionContext, done: Promise<void> = Promise.resolve()): void {
		context.waitUntil(done.finally(() => void this.#channel.disconnect().catch(() => {})));
	}

	#streamResponse(
		context: ExecutionContext,
		result: TelegramMediaDownloadResult,
		builder: (stream: ReadableStream<Uint8Array>) => Response,
	): Response {
		this.#scheduleDisconnect(context, result.done);
		return builder(result.stream);
	}

	async handle(request: Request, context: ExecutionContext): Promise<Response> {
		const factory = this.#factory;
		const { method, url, headers } = request;

		if (method === "OPTIONS") return factory.preflight();
		if (method !== "GET" && method !== "HEAD") return factory.error(405, "Method Not Allowed");

		const { searchParams } = new URL(url);
		const identifier = searchParams.get("identifier");
		const fileName = searchParams.get("filename");
		if (identifier === null) return factory.error(400, "Missing required query parameter: identifier");
		if (!MediaProxy.#IDENTIFIER_PATTERN.test(identifier)) return factory.error(400, "Invalid identifier format");

		const messageId = Number.parseInt(identifier, 10);
		let media;
		try {
			media = await this.#channel.fetchMedia(messageId);
		} catch (reason) {
			this.#scheduleDisconnect(context);
			throw reason;
		}

		const rangeHeader = headers.get("range");
		if (rangeHeader !== null) {
			const range = MediaProxy.#parseRange(rangeHeader, media.fileSize);
			if (range === 416) {
				this.#scheduleDisconnect(context);
				return factory.rangeNotSatisfiable(media);
			}
			if (range !== null) {
				const { start, end } = range;
				const limit = end !== undefined ? end - start + 1 : undefined;
				if (method === "HEAD") {
					this.#scheduleDisconnect(context);
					return factory.partial(media, fileName, range, null);
				}
				return this.#streamResponse(context, media.download({ offset: start, limit }), stream =>
					factory.partial(media, fileName, range, stream),
				);
			}
		}

		if (method === "HEAD") {
			this.#scheduleDisconnect(context);
			return factory.ok(media, fileName);
		}
		return this.#streamResponse(context, media.download(), stream => factory.ok(media, fileName, stream));
	}
}
//#endregion
