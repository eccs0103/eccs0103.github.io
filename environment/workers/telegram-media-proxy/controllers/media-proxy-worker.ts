"use strict";

import "adaptive-extender/core";
import { EnvironmentProvider, type Environment } from "adaptive-extender/core";
import { MediaProxy } from "../services/media-proxy.js";
import { CloudflareWorker } from "../../cloudflare-worker.js";
import { TelegramChannel } from "../services/telegram-channel.js";
import { ResponseFactory } from "../services/response-factory.js";
import { CacheService } from "../services/cache-service.js";
import { MediaProxyEnvironment } from "../models/media-proxy-environment.js";

//#region Telegram media proxy worker
class TelegramMediaProxyWorker extends CloudflareWorker {
	#factory: ResponseFactory = new ResponseFactory();
	#cache: CacheService = new CacheService();

	async run(request: Request, environment: Environment, context: ExecutionContext): Promise<Response> {
		const { method } = request;
		const key = method === "GET" ? this.#cache.keyFor(request) : null;
		if (key !== null) {
			const cached = await this.#cache.tryMatch(key);
			if (cached !== null) return cached;
		}

		const { channelId, apiId, apiHash, session } = EnvironmentProvider.resolve(environment, MediaProxyEnvironment);
		const channel = await TelegramChannel.connect(channelId, apiId, apiHash, session);
		const proxy = new MediaProxy(channel, this.#factory);
		const response = await proxy.handle(request, context);
		if (key !== null) this.#cache.tryStore(key, response, context);
		return response;
	}

	async catch(error: Error): Promise<Response> {
		return this.#factory.error(500, error.message);
	}
}

const worker = new TelegramMediaProxyWorker();
export default worker;
//#endregion
