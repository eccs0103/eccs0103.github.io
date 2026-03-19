"use strict";

import "adaptive-extender/core";
import { TelegramChannel } from "./telegram-channel.js";
import { type MediaRange, type TelegramMedia } from "./telegram-media.js";
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
		const start = Number.parseInt(match[1], 10);
		const endRaw = match[2];
		if (totalSize !== undefined && start >= totalSize) return 416;
		if (endRaw === "") return { start, end: totalSize !== undefined ? totalSize - 1 : undefined, total: totalSize };
		const end = Number.parseInt(endRaw, 10);
		if (end < start) return 416;
		const actualEnd = totalSize !== undefined ? Math.min(end, totalSize - 1) : end;
		return { start, end: actualEnd, total: totalSize };
	}

	async #awaitAndDisconnect(done: Promise<void>): Promise<void> {
		try { await done; } catch { /* download error already logged in TelegramMedia */ }
		try { await this.#channel.disconnect(); } catch { /* ignore */ }
	}

	#scheduleDisconnect(context: ExecutionContext, done: Promise<void> = Promise.resolve()): void {
		context.waitUntil(this.#awaitAndDisconnect(done));
	}

	async #fetchMedia(messageId: number, context: ExecutionContext): Promise<TelegramMedia> {
		try {
			return await this.#channel.fetchMedia(messageId);
		} catch (reason) {
			this.#scheduleDisconnect(context);
			throw reason;
		}
	}

	async handle(request: Request, context: ExecutionContext): Promise<Response> {
		const { method, url, headers } = request;
		const { searchParams } = new URL(url);
		const identifier = searchParams.get("identifier");
		const fileName = searchParams.get("filename");

		if (method === "OPTIONS") return this.#factory.preflight();
		if (method !== "GET" && method !== "HEAD") return this.#factory.error(405, "Method Not Allowed");
		if (identifier === null) return this.#factory.error(400, "Missing required query parameter: identifier");
		if (!MediaProxy.#IDENTIFIER_PATTERN.test(identifier)) return this.#factory.error(400, "Invalid identifier format");

		const messageId = Number.parseInt(identifier, 10);
		const media = await this.#fetchMedia(messageId, context);

		const rangeHeader = headers.get("range");
		if (rangeHeader !== null) {
			const range = MediaProxy.#parseRange(rangeHeader, media.fileSize);
			if (range === 416) {
				this.#scheduleDisconnect(context);
				return this.#factory.rangeNotSatisfiable(media);
			}
			if (range !== null) {
				const { start, end } = range;
				const limit = end !== undefined ? end - start + 1 : undefined;
				if (method === "HEAD") {
					this.#scheduleDisconnect(context);
					return this.#factory.partial(media, fileName, range, null);
				}
				const result = media.download({ offset: start, limit });
				this.#scheduleDisconnect(context, result.done);
				return this.#factory.partial(media, fileName, range, result.stream);
			}
		}

		if (method === "HEAD") {
			this.#scheduleDisconnect(context);
			return this.#factory.ok(media, fileName);
		}
		const result = media.download();
		this.#scheduleDisconnect(context, result.done);
		return this.#factory.ok(media, fileName, result.stream);
	}
}
//#endregion
