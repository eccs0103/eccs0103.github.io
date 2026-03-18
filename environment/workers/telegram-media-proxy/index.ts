"use strict";

import "adaptive-extender/core";
import { MediaProxy } from "./services/media-proxy.js";
import { CloudflareWorker } from "./services/cloudflare-worker.js";
import { Field, Model } from "adaptive-extender/core";

class Environment extends Model {
	@Field(Number, "TELEGRAM_CHANNEL_ID")
	channelId: number;

	@Field(Number, "TELEGRAM_API_ID")
	apiId: number;

	@Field(String, "TELEGRAM_API_HASH")
	apiHash: string;

	@Field(String, "TELEGRAM_SESSION")
	session: string;
}

class TelegramMediaProxyWorker extends CloudflareWorker<typeof Environment> {
	async run(request: Request, env: Readonly<Environment>, context: ExecutionContext): Promise<Response> {
		return await MediaProxy.handle(request, env.channelId, env.apiId, env.apiHash, env.session, context);
	}

	async catch(error: Error): Promise<Response> {
		return MediaProxy.errorResponse(500, error.message);
	}
}

const worker = new TelegramMediaProxyWorker(Environment);
export default worker;
