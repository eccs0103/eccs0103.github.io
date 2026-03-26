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

	static #parseRange(header: string, totalSize: number): MediaRange {
		const match = /^bytes=(\d+)-(\d*)$/.exec(header);
		if (match === null) throw new SyntaxError("Unparseable range header");
		const start = Number.parseInt(match[1], 10);
		const rawEnd = match[2];
		if (start >= totalSize) throw new RangeError("Start exceeds total size");
		if (rawEnd === "") return { start, end: totalSize - 1, total: totalSize };
		const end = Number.parseInt(rawEnd, 10);
		if (end < start) throw new RangeError("End precedes start");
		const actualEnd = Math.min(end, totalSize - 1);
		return { start, end: actualEnd, total: totalSize };
	}

	async #awaitAndDisconnect(completion: Promise<void>): Promise<void> {
		try { await completion; }
		catch (downloadError) { console.error("Download stream interrupted:", downloadError); }
		try { await this.#channel.disconnect(); }
		catch (disconnectError) { console.error("Channel disconnect failed:", disconnectError); }
	}

	#scheduleDisconnect(context: ExecutionContext, completion: Promise<void> = Promise.resolve()): void {
		context.waitUntil(this.#awaitAndDisconnect(completion));
	}

	async #fetchMedia(messageIdentifier: number, context: ExecutionContext): Promise<TelegramMedia> {
		try {
			return await this.#channel.fetchMedia(messageIdentifier);
		} catch (reason) {
			this.#scheduleDisconnect(context);
			throw reason;
		}
	}

	async handle(request: Request, context: ExecutionContext): Promise<Response> {
		const { method, url, headers } = request;
		const { searchParams } = new URL(url);
		const identifier = searchParams.get("identifier");
		const rawFileName = searchParams.get("filename");
		const fileName = rawFileName !== null ? rawFileName : "";

		if (method === "OPTIONS") return this.#factory.preflight();
		if (method !== "GET" && method !== "HEAD") return this.#factory.error(405, "Method Not Allowed");
		if (identifier === null) return this.#factory.error(400, "Missing required query parameter: identifier");
		if (!MediaProxy.#IDENTIFIER_PATTERN.test(identifier)) return this.#factory.error(400, "Invalid identifier format");

		const messageIdentifier = Number.parseInt(identifier, 10);
		const media = await this.#fetchMedia(messageIdentifier, context);

		const rangeHeader = headers.get("range");
		if (rangeHeader !== null) {
			try {
				const range = MediaProxy.#parseRange(rangeHeader, media.fileSize);
				const { start, end } = range;
				const limit = end !== Number.POSITIVE_INFINITY ? end - start + 1 : Number.POSITIVE_INFINITY;
				if (method === "HEAD") {
					this.#scheduleDisconnect(context);
					return this.#factory.partial(media, fileName, range, null);
				}
				const result = media.download(start, limit);
				this.#scheduleDisconnect(context, result.completion);
				return this.#factory.partial(media, fileName, range, result.stream);
			} catch (error) {
				this.#scheduleDisconnect(context);
				if (error instanceof RangeError) return this.#factory.rangeNotSatisfiable(media);
				if (error instanceof SyntaxError) return this.#factory.error(400, "Malformed Range header");
				throw error;
			}
		}

		if (method === "HEAD") {
			this.#scheduleDisconnect(context);
			return this.#factory.ok(media, fileName);
		}
		const result = media.download();
		this.#scheduleDisconnect(context, result.completion);
		return this.#factory.ok(media, fileName, result.stream);
	}
}
//#endregion
