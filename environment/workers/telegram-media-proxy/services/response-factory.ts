"use strict";

import "adaptive-extender/core";
import { type TelegramMedia } from "./telegram-media.js";

//#region Response factory
export class ResponseFactory {
	static #CORS: Record<string, string> = {
		["Access-Control-Allow-Origin"]: "*",
		["Access-Control-Allow-Methods"]: "GET, HEAD, OPTIONS",
		["Access-Control-Allow-Headers"]: "*",
		["Access-Control-Expose-Headers"]: "Content-Disposition, Content-Length",
	};

	#corsHeaders(): Headers {
		return new Headers(ResponseFactory.#CORS);
	}

	#mediaHeaders(media: TelegramMedia, fileName: string | null): Headers {
		const headers = this.#corsHeaders();
		headers.set("Content-Type", media.mimeType);
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

	error(status: number, message: string): Response {
		return new Response(message, { status, headers: this.#corsHeaders() });
	}
}
//#endregion
