"use strict";

import "adaptive-extender/core";
import { Activity } from "../models/activity.js";

//#region Authorization expired error
export class AuthorizationExpiredError extends Error {
	#platform: string;

	constructor(platform: string, message: string) {
		super(`Authorization for '${platform}' has expired: ${message}`);
		this.name = "AuthorizationExpiredError";
		this.#platform = platform;
	}

	get platform(): string { return this.#platform; }
}
//#endregion

//#region Activity walker
export class ActivityWalker {
	#name: string;

	constructor(name: string) {
		if (new.target === ActivityWalker) throw new TypeError("Unable to create an instance of an abstract class");
		this.#name = name;
	}

	get name(): string {
		return this.#name;
	}

	floor(since: Date, buffer: readonly Activity[]): Date {
		void buffer;
		return since;
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		void since;
	}
}
//#endregion
