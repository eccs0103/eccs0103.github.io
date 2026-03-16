"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";
import { type Environment, EnvironmentProvider } from "./services/worker-environment.js";
import { MediaProxy } from "./services/media-proxy.js";

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

class CloudflareWorker implements ExportedHandler<Environment> {
	async fetch(request: Request, environment: Environment): Promise<Response> {
		try {
			const env = EnvironmentProvider.resolve(environment, WorkerEnvironment);
			return await MediaProxy.handle(request, env.apiId, env.apiHash, env.session, env.channelId);
		} catch (reason) {
			return MediaProxy.errorResponse(500, Error.from(reason).message);
		}
	}
}

const worker = new CloudflareWorker();
export default worker;
