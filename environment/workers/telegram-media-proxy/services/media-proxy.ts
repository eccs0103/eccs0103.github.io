"use strict";

import "adaptive-extender/core";
import { TelegramChannel } from "./telegram-channel.js";

//#region Media proxy
export class MediaProxy {
	static #IDENTIFIER_PATTERN: RegExp = /^\d{1,15}$/;

	static #CORS: Record<string, string> = {
		["Access-Control-Allow-Origin"]: "*",
		["Access-Control-Allow-Methods"]: "GET, HEAD, OPTIONS",
		["Access-Control-Allow-Headers"]: "*",
		["Access-Control-Expose-Headers"]: "Content-Disposition, Content-Length, ETag",
	};

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

	static #notModified(headers: Headers): Response {
		return new Response(null, { status: 304, headers });
	}

	static #okHead(headers: Headers): Response {
		return new Response(null, { status: 200, headers });
	}

	static #ok(headers: Headers, body: BodyInit): Response {
		return new Response(body, { status: 200, headers });
	}

	static errorResponse(status: number, message: string): Response {
		return new Response(message, { status, headers: MediaProxy.#corsHeaders() });
	}

	static async handle(request: Request, channelId: number, apiId: number, apiHash: string, session: string, context: ExecutionContext): Promise<Response> {
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
		if (ifNoneMatch === etag || ifNoneMatch === identifier) return MediaProxy.#notModified(MediaProxy.#cacheHeaders(etag));

		if (request.method === "GET") {
			const cached = await caches.default.match(request);
			if (cached !== undefined) return cached;
		}

		const channel = await TelegramChannel.connect(channelId, apiId, apiHash, session);
		try {
			const media = await channel.fetchMedia(messageId);
			const headers = MediaProxy.#cacheHeaders(etag);
			headers.set("Content-Type", media.mimeType);
			if (media.fileSize !== undefined) headers.set("Content-Length", String(media.fileSize));
			if (fileName !== null) headers.set("Content-Disposition", `inline; filename="${fileName}"`);
			headers.set("X-Content-Type-Options", "nosniff");

			if (request.method === "HEAD") {
				await channel.disconnect();
				return MediaProxy.#okHead(headers);
			}

			const response = MediaProxy.#ok(headers, media.download());
			context.waitUntil(caches.default.put(new Request(request.url), response.clone()));
			return response;
		} catch (reason) {
			await channel.disconnect();
			if (reason instanceof ReferenceError) return MediaProxy.errorResponse(404, reason.message);
			if (reason instanceof TypeError) return MediaProxy.errorResponse(404, reason.message);
			return MediaProxy.errorResponse(502, `Upstream error: ${Error.from(reason).message}`);
		}
	}
}
//#endregion
