"use strict";

import "adaptive-extender/core";
import { TelegramGetFileResponse } from "../models/telegram-api.js";

//#region Media proxy
export class MediaProxy {
	static #IDENTIFIER_PATTERN: RegExp = /^[A-Za-z0-9_\-]{1,512}$/;

	static #CORS: Record<string, string> = {
		["Access-Control-Allow-Origin"]: "*",
		["Access-Control-Allow-Methods"]: "GET, HEAD, OPTIONS",
		["Access-Control-Allow-Headers"]: "*",
		["Access-Control-Expose-Headers"]: "Content-Disposition, Content-Length, Content-Range, Accept-Ranges, ETag",
	};

	static #corsHeaders(): Headers {
		return new Headers(MediaProxy.#CORS);
	}

	static errorResponse(status: number, message: string): Response {
		return new Response(message, { status, headers: MediaProxy.#corsHeaders() });
	}

	static async #resolveFilePath(token: string, identifier: string): Promise<string> {
		const url = new URL(`https://api.telegram.org/bot${token}/getFile`);
		url.searchParams.set("file_id", identifier);
		const response = await fetch(url);
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const object = await response.json();
		const data = TelegramGetFileResponse.import(object, "Telegram getFile response");
		if (!data.ok || data.result === undefined) throw new Error(data.description ?? "Telegram API error");
		const { filePath } = data.result;
		if (filePath === undefined) throw new Error("Telegram returned no file_path");
		if (filePath.includes("..") || filePath.startsWith("/")) throw new Error("Invalid file_path from Telegram");
		return filePath;
	}

	static async #pipe(request: Request, token: string, filePath: string, fileName: string | null, etag: string): Promise<Response> {
		const quotedEtag = `"${etag}"`;
		const ifNoneMatch = request.headers.get("If-None-Match");
		if (ifNoneMatch === quotedEtag || ifNoneMatch === etag) {
			const headers = MediaProxy.#corsHeaders();
			headers.set("ETag", quotedEtag);
			headers.set("Cache-Control", "public, max-age=31536000, immutable");
			return new Response(null, { status: 304, headers });
		}

		const url = new URL(`https://api.telegram.org/file/bot${token}/${filePath}`);
		const upstreamHeaders: Record<string, string> = { "Accept-Encoding": "identity" };
		const range = request.headers.get("Range");
		if (range !== null) upstreamHeaders["Range"] = range;
		const upstream = await fetch(url, { headers: upstreamHeaders });
		if (!upstream.ok && upstream.status !== 206) throw new Error(`${upstream.status}: ${upstream.statusText}`);

		const headers = MediaProxy.#corsHeaders();
		const contentType = upstream.headers.get("Content-Type");
		if (contentType !== null) headers.set("Content-Type", contentType);
		const contentLength = upstream.headers.get("Content-Length");
		if (contentLength !== null) headers.set("Content-Length", contentLength);
		const contentRange = upstream.headers.get("Content-Range");
		if (contentRange !== null) headers.set("Content-Range", contentRange);
		headers.set("Accept-Ranges", upstream.headers.get("Accept-Ranges") ?? "bytes");
		headers.set("ETag", quotedEtag);
		headers.set("Cache-Control", "public, max-age=31536000, immutable");
		const lastModified = upstream.headers.get("Last-Modified");
		if (lastModified !== null) headers.set("Last-Modified", lastModified);
		if (fileName === null) fileName = filePath.split("/").at(-1) ?? null;
		if (fileName !== null) headers.set("Content-Disposition", `inline; filename="${fileName}"`);
		headers.set("X-Content-Type-Options", "nosniff");

		const isHead = request.method === "HEAD";
		return new Response(isHead ? null : upstream.body, { status: upstream.status, headers });
	}

	static async handle(request: Request, token: string): Promise<Response> {
		if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: MediaProxy.#corsHeaders() });
		if (request.method !== "GET" && request.method !== "HEAD") return MediaProxy.errorResponse(405, "Method Not Allowed");

		const { searchParams } = new URL(request.url);
		const identifier = searchParams.get("identifier");
		const fileName = searchParams.get("filename");
		if (identifier === null) return MediaProxy.errorResponse(400, "Missing required query parameter: identifier");
		if (!MediaProxy.#IDENTIFIER_PATTERN.test(identifier)) return MediaProxy.errorResponse(400, "Invalid identifier format");

		try {
			const filePath = await MediaProxy.#resolveFilePath(token, identifier);
			return await MediaProxy.#pipe(request, token, filePath, fileName, identifier);
		} catch (reason) {
			return MediaProxy.errorResponse(502, `Upstream error: ${Error.from(reason).message}`);
		}
	}
}
//#endregion
