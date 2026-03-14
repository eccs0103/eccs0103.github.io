"use strict";

import "adaptive-extender/core";
import { TelegramClient, MemoryStorage, FileLocation, Photo, RawDocument, WebCryptoProvider } from "@mtcute/web";
import wasmInput from "@mtcute/wasm/mtcute-simd.wasm";

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

	static errorResponse(status: number, message: string): Response {
		return new Response(message, { status, headers: MediaProxy.#corsHeaders() });
	}

	static async handle(request: Request, apiId: number, apiHash: string, session: string, channelId: number): Promise<Response> {
		if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: MediaProxy.#corsHeaders() });
		if (request.method !== "GET" && request.method !== "HEAD") return MediaProxy.errorResponse(405, "Method Not Allowed");

		const { searchParams } = new URL(request.url);
		const identifier = searchParams.get("identifier");
		const fileName = searchParams.get("filename");
		if (identifier === null) return MediaProxy.errorResponse(400, "Missing required query parameter: identifier");
		if (!MediaProxy.#IDENTIFIER_PATTERN.test(identifier)) return MediaProxy.errorResponse(400, "Invalid identifier format");

		const messageId = Number.parseInt(identifier, 10);
		const quotedEtag = `"${identifier}"`;
		const ifNoneMatch = request.headers.get("If-None-Match");
		if (ifNoneMatch === quotedEtag || ifNoneMatch === identifier) {
			const headers = MediaProxy.#corsHeaders();
			headers.set("ETag", quotedEtag);
			headers.set("Cache-Control", "public, max-age=31536000, immutable");
			return new Response(null, { status: 304, headers });
		}

		const storage = new MemoryStorage();
		const disableUpdates = true;
		const crypto = new WebCryptoProvider({ wasmInput });
		const telegram = new TelegramClient({ apiId, apiHash, storage, disableUpdates, crypto });
		await telegram.importSession(session);
		await telegram.connect();
		try {
			const messages = await telegram.getMessages(channelId, [messageId]);
			const [message] = messages;
			if (message === null) return MediaProxy.errorResponse(404, "Message not found");
			const { media } = message;
			if (media === null) return MediaProxy.errorResponse(404, "Message has no media");
			if (!(media instanceof FileLocation)) return MediaProxy.errorResponse(404, "Message media is not downloadable");
			const mimeType = media instanceof Photo ? "image/jpeg" : media instanceof RawDocument ? media.mimeType : "application/octet-stream";
			const { fileSize } = media;

			const headers = MediaProxy.#corsHeaders();
			headers.set("Content-Type", mimeType);
			headers.set("ETag", quotedEtag);
			headers.set("Cache-Control", "public, max-age=31536000, immutable");
			if (fileSize !== undefined) headers.set("Content-Length", String(fileSize));
			if (fileName !== null) headers.set("Content-Disposition", `inline; filename="${fileName}"`);
			headers.set("X-Content-Type-Options", "nosniff");

			if (request.method === "HEAD") {
				await telegram.disconnect();
				return new Response(null, { status: 200, headers });
			}

			const upstream = telegram.downloadAsStream(media);
			const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
			const cleanup = (): void => { void telegram.disconnect(); };
			void upstream.pipeTo(writable).then(cleanup, cleanup);
			return new Response(readable, { status: 200, headers });
		} catch (reason) {
			await telegram.disconnect();
			return MediaProxy.errorResponse(502, `Upstream error: ${Error.from(reason).message}`);
		}
	}
}
//#endregion
