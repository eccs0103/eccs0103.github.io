"use strict";

import "adaptive-extender/core";
import { type TelegramMedia } from "./telegram-media.js";

//#region Response factory
export class ResponseFactory {
	static #CORS: Record<string, string> = {
		["Access-Control-Allow-Origin"]: "*",
		["Access-Control-Allow-Methods"]: "GET, HEAD, OPTIONS",
		["Access-Control-Allow-Headers"]: "*",
		["Access-Control-Expose-Headers"]: "Content-Disposition, Content-Length, ETag",
	};

	#corsHeaders(): Headers {
		return new Headers(ResponseFactory.#CORS);
	}

	#cacheHeaders(etag: string): Headers {
		const headers = this.#corsHeaders();
		headers.set("ETag", etag);
		headers.set("Cache-Control", "public, max-age=31536000, immutable");
		return headers;
	}

	#mediaHeaders(etag: string, media: TelegramMedia, fileName: string | null): Headers {
		const headers = this.#cacheHeaders(etag);
		headers.set("Content-Type", media.mimeType);
		headers.set("Accept-Ranges", "bytes");
		headers.set("X-Content-Type-Options", "nosniff");
		if (media.fileSize !== undefined) headers.set("Content-Length", String(media.fileSize));
		if (fileName !== null) headers.set("Content-Disposition", `inline; filename="${fileName}"`);
		return headers;
	}

	preflight(): Response {
		return new Response(null, { status: 204, headers: this.#corsHeaders() });
	}

	notModified(etag: string): Response {
		return new Response(null, { status: 304, headers: this.#cacheHeaders(etag) });
	}

	ok(etag: string, media: TelegramMedia, fileName: string | null, body: BodyInit | null = null): Response {
		return new Response(body, { status: 200, headers: this.#mediaHeaders(etag, media, fileName) });
	}

	error(status: number, message: string): Response {
		return new Response(message, { status, headers: this.#corsHeaders() });
	}
}
//#endregion
