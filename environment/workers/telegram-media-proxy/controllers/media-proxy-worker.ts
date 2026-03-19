"use strict";

import "adaptive-extender/core";
import { EnvironmentProvider, type Environment } from "adaptive-extender/core";
import { MediaProxy } from "../services/media-proxy.js";
import { CloudflareWorker } from "../../cloudflare-worker.js";
import { TelegramChannel } from "../services/telegram-channel.js";
import { ResponseFactory } from "../services/response-factory.js";
import { MediaProxyEnvironment } from "../models/media-proxy-environment.js";

//#region Telegram media proxy worker
class TelegramMediaProxyWorker extends CloudflareWorker {
	#factory: ResponseFactory = new ResponseFactory();

	async run(request: Request, environment: Environment, context: ExecutionContext): Promise<Response> {
		void context;
		const { channelId, apiId, apiHash, session } = EnvironmentProvider.resolve(environment, MediaProxyEnvironment);
		const channel = await TelegramChannel.connect(channelId, apiId, apiHash, session);
		const proxy = new MediaProxy(channel, this.#factory);
		try {
			return await proxy.handle(request, context);
		} finally {
			await channel.disconnect();
		}
	}

	async catch(error: Error): Promise<Response> {
		return this.#factory.error(500, error.message);
	}
}

const worker = new TelegramMediaProxyWorker();
export default worker;
//#endregion
