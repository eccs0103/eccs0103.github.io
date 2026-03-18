"use strict";

import "adaptive-extender/core";
import { TelegramChannel } from "./telegram-channel.js";
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

	#parseRange(rangeHeader: string, fileSize: number): { start: number; end: number } | null | "unsatisfiable" {
		const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
		if (match === null) return null;
		const startStr = match[1];
		const endStr = match[2];
		let start: number;
		let end: number;
		if (startStr === "" && endStr === "") return null;
		if (startStr === "") {
			// suffix range: bytes=-N (last N bytes)
			const suffix = Number.parseInt(endStr, 10);
			start = Math.max(0, fileSize - suffix);
			end = fileSize - 1;
		} else {
			start = Number.parseInt(startStr, 10);
			end = endStr === "" ? fileSize - 1 : Number.parseInt(endStr, 10);
		}
		if (start > end || start >= fileSize) return "unsatisfiable";
		end = Math.min(end, fileSize - 1);
		return { start, end };
	}

	async handle(request: Request): Promise<Response> {
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
		const media = await this.#channel.fetchMedia(messageId);
		const isGet = method === "GET";

		const rangeHeader = headers.get("Range");
		if (rangeHeader !== null && media.fileSize !== undefined) {
			const range = this.#parseRange(rangeHeader, media.fileSize);
			if (range === "unsatisfiable") {
				media.dispose();
				return factory.unsatisfiable(media.fileSize);
			}
			if (range !== null) {
				const { start, end } = range;
				const body = isGet ? media.download(start, end - start + 1) : null;
				if (!isGet) media.dispose();
				return factory.partial(media, fileName, start, end, media.fileSize, body);
			}
		}

		const body = isGet ? media.download() : null;
		if (!isGet) media.dispose();
		return factory.ok(media, fileName, body);
	}
}
//#endregion
