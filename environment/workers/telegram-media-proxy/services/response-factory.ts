"use strict";

import "adaptive-extender/core";
import { type TelegramMedia, type MediaRange } from "./telegram-media.js";

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

	#mediaHeaders(media: TelegramMedia, fileName: string): Headers {
		const headers = this.#corsHeaders();
		headers.set("Content-Type", media.mimeType);
		headers.set("Accept-Ranges", "bytes");
		headers.set("X-Content-Type-Options", "nosniff");
		const fileSize = media.fileSize;
		if (fileSize !== Number.POSITIVE_INFINITY) headers.set("Content-Length", String(fileSize));
		if (fileName !== "") headers.set("Content-Disposition", `inline; filename="${fileName}"`);
		return headers;
	}

	preflight(): Response {
		return new Response(null, { status: 204, headers: this.#corsHeaders() });
	}

	ok(media: TelegramMedia, fileName: string, body: BodyInit | null = null): Response {
		return new Response(body, { status: 200, headers: this.#mediaHeaders(media, fileName) });
	}

	partial(media: TelegramMedia, fileName: string, range: MediaRange, body: BodyInit | null = null): Response {
		const { start, end, total } = range;
		const headers = this.#mediaHeaders(media, fileName);
		if (end !== Number.POSITIVE_INFINITY) {
			const totalString = total !== Number.POSITIVE_INFINITY ? String(total) : "*";
			headers.set("Content-Range", `bytes ${start}-${end}/${totalString}`);
			headers.set("Content-Length", String(end - start + 1));
			return new Response(body, { status: 206, headers });
		}
		if (total !== Number.POSITIVE_INFINITY) headers.set("Content-Length", String(total - start));
		return new Response(body, { status: 200, headers });
	}

	rangeNotSatisfiable(media: TelegramMedia): Response {
		const headers = this.#corsHeaders();
		const fileSize = media.fileSize;
		if (fileSize !== Number.POSITIVE_INFINITY) headers.set("Content-Range", `bytes */${fileSize}`);
		return new Response("Range Not Satisfiable", { status: 416, headers });
	}

	error(status: number, message: string): Response {
		return new Response(message, { status, headers: this.#corsHeaders() });
	}
}
//#endregion
