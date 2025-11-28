"use strict";

import "adaptive-extender/web";

//#region User activity
class UserActivity {
	#platform: string;
	#type: string;
	#description: string;
	#url: string;
	#timestamp: string;

	constructor(platform: string, type: string, description: string, uel: string, timestamp: string) {
		this.#platform = platform;
		this.#type = type;
		this.#description = description;
		this.#url = uel;
		this.#timestamp = timestamp;
	}

	get platform(): string {
		return this.#platform;
	}

	get type(): string {
		return this.#type;
	}

	get description(): string {
		return this.#description;
	}

	get url(): string {
		return this.#url;
	}

	get timestamp(): string {
		return this.#timestamp;
	}
}
//#endregion

export { UserActivity };
