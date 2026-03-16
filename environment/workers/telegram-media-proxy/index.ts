"use strict";

import "adaptive-extender/core";
import { MediaProxy } from "./services/media-proxy.js";

//#region Worker handler
export interface WorkerEnvironment {
	["TELEGRAM_API_ID"]?: string;
	["TELEGRAM_API_HASH"]?: string;
	["TELEGRAM_SESSION"]?: string;
	["TELEGRAM_CHANNEL_ID"]?: string;
}

export default {
	async fetch(request: Request, environment: WorkerEnvironment): Promise<Response> {
		const apiId = Number(environment["TELEGRAM_API_ID"]);
		const apiHash = environment["TELEGRAM_API_HASH"];
		const session = environment["TELEGRAM_SESSION"];
		const channelId = Number(environment["TELEGRAM_CHANNEL_ID"]);
		if (!apiId || !apiHash || !session || !channelId) return MediaProxy.errorResponse(500, "Missing required environment variables");
		return await MediaProxy.handle(request, apiId, apiHash, session, channelId);
	},
} satisfies ExportedHandler<WorkerEnvironment>;
//#endregion
