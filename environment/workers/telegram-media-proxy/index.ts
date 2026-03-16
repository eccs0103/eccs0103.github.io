"use strict";

import "adaptive-extender/core";
import { MediaProxy } from "./services/media-proxy.js";
import { CloudflareWorker } from "./services/cloudflare-worker.js";
import { Field, Model } from "adaptive-extender/core";

export class WorkerEnvironment extends Model {
	@Field(Number, "TELEGRAM_API_ID")
	apiId: number;

	@Field(String, "TELEGRAM_API_HASH")
	apiHash: string;

	@Field(String, "TELEGRAM_SESSION")
	session: string;

	@Field(Number, "TELEGRAM_CHANNEL_ID")
	channelId: number;
}

class TelegramMediaProxyWorker extends CloudflareWorker<typeof WorkerEnvironment> {
	async run(request: Request, env: Readonly<WorkerEnvironment>): Promise<Response> {
		return await MediaProxy.handle(request, env.apiId, env.apiHash, env.session, env.channelId);
	}

	async catch(error: Error): Promise<Response> {
		return MediaProxy.errorResponse(500, error.message);
	}
}

const worker = new TelegramMediaProxyWorker(WorkerEnvironment);
export default worker;
