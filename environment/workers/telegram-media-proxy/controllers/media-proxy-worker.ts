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
		const factory = this.#factory;
		const { method, url } = request;

		// Fast-path: respond without connecting to Telegram
		if (method === "OPTIONS") return factory.preflight();
		if (method !== "GET" && method !== "HEAD") return factory.error(405, "Method Not Allowed");
		const identifier = new URL(url).searchParams.get("identifier");
		if (identifier === null) return factory.error(400, "Missing required query parameter: identifier");
		if (!/^\d{1,15}$/.test(identifier)) return factory.error(400, "Invalid identifier format");

		const { channelId, apiId, apiHash, session } = EnvironmentProvider.resolve(environment, MediaProxyEnvironment);
		const channel = await TelegramChannel.connect(channelId, apiId, apiHash, session);
		const proxy = new MediaProxy(channel, factory);
		return proxy.handle(request, context);
	}

	async catch(error: Error): Promise<Response> {
		return this.#factory.error(500, error.message);
	}
}

const worker = new TelegramMediaProxyWorker();
export default worker;
//#endregion
