"use strict";

import "adaptive-extender/core";
import { MediaProxy } from "./services/media-proxy.js";
import { CloudflareWorker } from "./services/cloudflare-worker.js";
import { EnvironmentProvider, Field, Model, type Environment } from "adaptive-extender/core";
import { TelegramChannel } from "./services/telegram-channel.js";

class MediaProxyEnvironment extends Model {
	@Field(Number, "TELEGRAM_CHANNEL_ID")
	channelId: number;

	@Field(Number, "TELEGRAM_API_ID")
	apiId: number;

	@Field(String, "TELEGRAM_API_HASH")
	apiHash: string;

	@Field(String, "TELEGRAM_SESSION")
	session: string;
}

class TelegramMediaProxyWorker extends CloudflareWorker {
	async run(request: Request, environment: Environment, context: ExecutionContext): Promise<Response> {
		const { channelId, apiId, apiHash, session } = EnvironmentProvider.resolve(environment, MediaProxyEnvironment);
		const channel = await TelegramChannel.connect(channelId, apiId, apiHash, session);
		const proxy = new MediaProxy(channel);
		try {
			return await proxy.handle(request, context);
		} finally {
			await channel.disconnect();
		}
	}

	async catch(error: Error): Promise<Response> {
		return MediaProxy.errorResponse(500, error.message);
	}
}

const worker = new TelegramMediaProxyWorker();
export default worker;
