"use strict";

import "adaptive-extender/core";
import { type TelegramMedia } from "./telegram-media.js";

//#region Response factory
export class ResponseFactory {
	static #CORS: Record<string, string> = {
		["Access-Control-Allow-Origin"]: "*",
		["Access-Control-Allow-Methods"]: "GET, HEAD, OPTIONS",
		["Access-Control-Allow-Headers"]: "*",
		["Access-Control-Expose-Headers"]: "Content-Disposition, Content-Length, Content-Range",
	};

	#corsHeaders(): Headers {
		return new Headers(ResponseFactory.#CORS);
	}

	#mediaHeaders(media: TelegramMedia, fileName: string | null, contentLength?: number): Headers {
		const headers = this.#corsHeaders();
		headers.set("Content-Type", media.mimeType);
		headers.set("Accept-Ranges", "bytes");
		headers.set("Cache-Control", "no-store");
		headers.set("X-Content-Type-Options", "nosniff");
		const length = contentLength ?? media.fileSize;
		if (length !== undefined) headers.set("Content-Length", String(length));
		if (fileName !== null) headers.set("Content-Disposition", `inline; filename="${fileName}"`);
		return headers;
	}

	preflight(): Response {
		return new Response(null, { status: 204, headers: this.#corsHeaders() });
	}

	ok(media: TelegramMedia, fileName: string | null, body: BodyInit | null = null): Response {
		return new Response(body, { status: 200, headers: this.#mediaHeaders(media, fileName) });
	}

	partial(media: TelegramMedia, fileName: string | null, start: number, end: number, total: number, body: BodyInit | null = null): Response {
		const headers = this.#mediaHeaders(media, fileName, end - start + 1);
		headers.set("Content-Range", `bytes ${start}-${end}/${total}`);
		return new Response(body, { status: 206, headers });
	}

	unsatisfiable(total: number): Response {
		const headers = this.#corsHeaders();
		headers.set("Content-Range", `bytes */${total}`);
		return new Response(null, { status: 416, headers });
	}

	error(status: number, message: string): Response {
		return new Response(message, { status, headers: this.#corsHeaders() });
	}
}
//#endregion
