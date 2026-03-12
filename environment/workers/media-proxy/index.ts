"use strict";

import "adaptive-extender/node";
import { Field, Model, Optional } from "adaptive-extender/core";
import { env } from "../../services/local-environment.js";

//#region Telegram API response
export interface TelegramFileScheme {
	file_id: string;
	file_path?: string;
}

export class TelegramFile extends Model {
	@Field(String, "file_id")
	fileId: string;

	@Field(Optional(String), "file_path")
	filePath?: string;
}

export interface TelegramGetFileResponseScheme {
	ok: boolean;
	result?: TelegramFileScheme;
	description?: string;
}

export class TelegramGetFileResponse extends Model {
	@Field(Boolean, "ok")
	ok: boolean;

	@Field(Optional(TelegramFile), "result")
	result?: TelegramFile;

	@Field(Optional(String), "description")
	description?: string;
}
//#endregion

//#region Media proxy
class MediaProxy {
	static readonly #IDENTIFIER_PATTERN: RegExp = /^[A-Za-z0-9_\-]{1,512}$/;

	static readonly #CORS: Record<string, string> = {
		["Access-Control-Allow-Origin"]: "*",
		["Access-Control-Allow-Methods"]: "GET, OPTIONS",
		["Access-Control-Allow-Headers"]: "*",
	};

	static #corsHeaders(): Headers {
		return new Headers(MediaProxy.#CORS);
	}

	static #errorResponse(status: number, message: string): Response {
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

	static async #pipe(token: string, filePath: string): Promise<Response> {
		const url = new URL(`https://api.telegram.org/file/bot${token}/${filePath}`);
		const upstream = await fetch(url);
		if (!upstream.ok) throw new Error(`${upstream.status}: ${upstream.statusText}`);
		const headers = MediaProxy.#corsHeaders();
		const contentType = upstream.headers.get("Content-Type");
		if (contentType !== null) headers.set("Content-Type", contentType);
		const contentLength = upstream.headers.get("Content-Length");
		if (contentLength !== null) headers.set("Content-Length", contentLength);
		return new Response(upstream.body, { status: 200, headers });
	}

	static async handle(request: Request): Promise<Response> {
		if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: MediaProxy.#corsHeaders() });
		if (request.method !== "GET") return MediaProxy.#errorResponse(405, "Method Not Allowed");

		const { searchParams } = new URL(request.url);
		const identifier = searchParams.get("identifier");
		if (identifier === null) return MediaProxy.#errorResponse(400, "Missing required query parameter: identifier");
		if (!MediaProxy.#IDENTIFIER_PATTERN.test(identifier)) return MediaProxy.#errorResponse(400, "Invalid identifier format");

		try {
			const token = env.telegramBotToken;
			const filePath = await MediaProxy.#resolveFilePath(token, identifier);
			return await MediaProxy.#pipe(token, filePath);
		} catch (reason) {
			return MediaProxy.#errorResponse(502, `Upstream error: ${Error.from(reason).message}`);
		}
	}
}
//#endregion

//#region Worker handler
export default class WorkerHandler {
	fetch(request: Request): Promise<Response> {
		return MediaProxy.handle(request);
	}
}
//#endregion
