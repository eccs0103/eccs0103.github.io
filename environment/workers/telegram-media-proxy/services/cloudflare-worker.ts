"use strict";

import "adaptive-extender/core";
import { EnvironmentProvider, type Environment, type PortableConstructor } from "adaptive-extender/core";

//#region Cloudflare worker
export abstract class CloudflareWorker<M extends PortableConstructor<InstanceType<M>>> implements ExportedHandler<Environment> {
	#model: M;

	constructor(model: M) {
		if (new.target === CloudflareWorker) throw new TypeError("Unable to create an instance of an abstract class");
		this.#model = model;
	}

	async run(request: Request, env: Readonly<InstanceType<M>>, context: ExecutionContext): Promise<Response> {
		void request, env, context;
		return new Response(null, { status: 501 });
	}

	async catch(error: Error): Promise<Response> {
		void error;
		return new Response(null, { status: 501 });
	}

	async fetch(request: Request, environment: Environment, context: ExecutionContext): Promise<Response> {
		const env = EnvironmentProvider.resolve(environment, this.#model);
		try {
			return await this.run(request, env, context);
		} catch (reason) {
			return await this.catch(Error.from(reason));
		}
	}
}
//#endregion
