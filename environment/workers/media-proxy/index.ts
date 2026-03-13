"use strict";

import "adaptive-extender/core";
import { MediaProxy } from "./services/media-proxy.js";

//#region Worker handler
export interface WorkerEnvironment {
	["TELEGRAM_BOT_TOKEN"]?: string;
}

export default {
	async fetch(request: Request, environment: WorkerEnvironment): Promise<Response> {
		const token = environment["TELEGRAM_BOT_TOKEN"];
		if (token === undefined) return MediaProxy.errorResponse(500, "Missing required environment variable: TELEGRAM_BOT_TOKEN");
		return await MediaProxy.handle(request, token);
	},
} satisfies ExportedHandler<WorkerEnvironment>;
//#endregion
