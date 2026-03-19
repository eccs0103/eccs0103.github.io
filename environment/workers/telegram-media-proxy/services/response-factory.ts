"use strict";

import "adaptive-extender/core";
import { type TelegramMedia } from "./telegram-media.js";
import { type MediaRange } from "./telegram-media.js";

//#region Response factory
export class ResponseFactory {
	static #CORS: Record<string, string> = {
		["Access-Control-Allow-Origin"]: "*",
		["Access-Control-Allow-Methods"]: "GET, HEAD, OPTIONS",
		["Access-Control-Allow-Headers"]: "*",
		["Access-Control-Expose-Headers"]: "Content-Disposition, Content-Length, Content-Range, Accept-Ranges",
	};

	#corsHeaders(): Headers {
		return new Headers(ResponseFactory.#CORS);
	}

	#mediaHeaders(media: TelegramMedia, fileName: string | null): Headers {
		const headers = this.#corsHeaders();
		headers.set("Content-Type", media.mimeType);
		headers.set("Accept-Ranges", "bytes");
		headers.set("X-Content-Type-Options", "nosniff");
		const { fileSize } = media;
		if (fileSize !== undefined) headers.set("Content-Length", String(fileSize));
		if (fileName !== null) headers.set("Content-Disposition", `inline; filename="${fileName}"`);
		return headers;
	}

	preflight(): Response {
		return new Response(null, { status: 204, headers: this.#corsHeaders() });
	}

	ok(media: TelegramMedia, fileName: string | null, body: BodyInit | null = null): Response {
		return new Response(body, { status: 200, headers: this.#mediaHeaders(media, fileName) });
	}

	partial(media: TelegramMedia, fileName: string | null, range: MediaRange, body: BodyInit | null = null): Response {
		const { start, end, total } = range;
		const headers = this.#corsHeaders();
		headers.set("Content-Type", media.mimeType);
		headers.set("Accept-Ranges", "bytes");
		headers.set("X-Content-Type-Options", "nosniff");
		if (fileName !== null) headers.set("Content-Disposition", `inline; filename="${fileName}"`);
		if (end !== undefined) {
			const totalStr = total !== undefined ? String(total) : "*";
			headers.set("Content-Range", `bytes ${start}-${end}/${totalStr}`);
			headers.set("Content-Length", String(end - start + 1));
			return new Response(body, { status: 206, headers });
		}
		// Open-ended range with unknown total: stream from offset, report as full response
		if (total !== undefined) headers.set("Content-Length", String(total - start));
		return new Response(body, { status: 200, headers });
	}

	rangeNotSatisfiable(media: TelegramMedia): Response {
		const headers = this.#corsHeaders();
		const { fileSize } = media;
		if (fileSize !== undefined) headers.set("Content-Range", `bytes */${fileSize}`);
		return new Response("Range Not Satisfiable", { status: 416, headers });
	}

	error(status: number, message: string): Response {
		return new Response(message, { status, headers: this.#corsHeaders() });
	}
}
//#endregion
