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

	async handle(request: Request, context: ExecutionContext): Promise<Response> {
		void context;
		const factory = this.#factory;
		const { method, url } = request;

		if (method === "OPTIONS") return factory.preflight();
		if (method !== "GET" && method !== "HEAD") return factory.error(405, "Method Not Allowed");

		const { searchParams } = new URL(url);
		const identifier = searchParams.get("identifier");
		const fileName = searchParams.get("filename");
		if (identifier === null) return factory.error(400, "Missing required query parameter: identifier");
		if (!MediaProxy.#IDENTIFIER_PATTERN.test(identifier)) return factory.error(400, "Invalid identifier format");

		const messageId = Number.parseInt(identifier, 10);
		const media = await this.#channel.fetchMedia(messageId);
		if (method === "HEAD") return factory.ok(media, fileName);
		return factory.ok(media, fileName, media.download());
	}
}
//#endregion
