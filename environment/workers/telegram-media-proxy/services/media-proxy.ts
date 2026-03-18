"use strict";

import "adaptive-extender/core";
import { TelegramChannel } from "./telegram-channel.js";
import { type TelegramMedia } from "./telegram-media.js";

//#region Media proxy
export class MediaProxy {
	static #IDENTIFIER_PATTERN: RegExp = /^\d{1,15}$/;

	static #CORS: Record<string, string> = {
		["Access-Control-Allow-Origin"]: "*",
		["Access-Control-Allow-Methods"]: "GET, HEAD, OPTIONS",
		["Access-Control-Allow-Headers"]: "*",
		["Access-Control-Expose-Headers"]: "Content-Disposition, Content-Length, ETag",
	};

	#channel: TelegramChannel;

	constructor(channel: TelegramChannel) {
		this.#channel = channel;
	}

	static #corsHeaders(): Headers {
		return new Headers(MediaProxy.#CORS);
	}

	static #cacheHeaders(etag: string): Headers {
		const headers = MediaProxy.#corsHeaders();
		headers.set("ETag", etag);
		headers.set("Cache-Control", "public, max-age=31536000, immutable");
		return headers;
	}

	static #preflight(): Response {
		return new Response(null, { status: 204, headers: MediaProxy.#corsHeaders() });
	}

	static #notModified(etag: string): Response {
		return new Response(null, { status: 304, headers: MediaProxy.#cacheHeaders(etag) });
	}

	static #ok(etag: string, media: TelegramMedia, fileName: string | null, body: BodyInit | null = null): Response {
		const headers = MediaProxy.#cacheHeaders(etag);
		headers.set("Content-Type", media.mimeType);
		if (media.fileSize !== undefined) headers.set("Content-Length", String(media.fileSize));
		if (fileName !== null) headers.set("Content-Disposition", `inline; filename="${fileName}"`);
		headers.set("Accept-Ranges", "bytes");
		headers.set("X-Content-Type-Options", "nosniff");
		return new Response(body, { status: 200, headers });
	}

	static errorResponse(status: number, message: string): Response {
		return new Response(message, { status, headers: MediaProxy.#corsHeaders() });
	}

	async handle(request: Request, context: ExecutionContext): Promise<Response> {
		if (request.method === "OPTIONS") return MediaProxy.#preflight();
		if (request.method !== "GET" && request.method !== "HEAD") return MediaProxy.errorResponse(405, "Method Not Allowed");

		const { searchParams } = new URL(request.url);
		const identifier = searchParams.get("identifier");
		const fileName = searchParams.get("filename");
		if (identifier === null) return MediaProxy.errorResponse(400, "Missing required query parameter: identifier");
		if (!MediaProxy.#IDENTIFIER_PATTERN.test(identifier)) return MediaProxy.errorResponse(400, "Invalid identifier format");

		const messageId = Number.parseInt(identifier, 10);
		const etag = `"${identifier}"`;
		const ifNoneMatch = request.headers.get("If-None-Match");
		if (ifNoneMatch === etag || ifNoneMatch === identifier) return MediaProxy.#notModified(etag);

		if (request.method === "GET") {
			const cached = await caches.default.match(request);
			if (cached !== undefined) return cached;
		}

		try {
			const media = await this.#channel.fetchMedia(messageId);

			if (request.method === "HEAD") return MediaProxy.#ok(etag, media, fileName);

			const response = MediaProxy.#ok(etag, media, fileName, media.download());
			context.waitUntil(caches.default.put(new Request(request.url), response.clone()));
			return response;
		} catch (reason) {
			if (reason instanceof ReferenceError) return MediaProxy.errorResponse(404, reason.message);
			if (reason instanceof TypeError) return MediaProxy.errorResponse(404, reason.message);
			return MediaProxy.errorResponse(502, `Upstream error: ${Error.from(reason).message}`);
		}
	}
}
//#endregion
