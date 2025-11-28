"use strict";

import "adaptive-extender/node";

//#region User activity
interface UserActivityScheme {
	platform: string;
	type: string;
	description: string;
	url: string;
	timestamp: string;
}

class UserActivity {
	#platform: string;
	#type: string;
	#description: string;
	#url: string;
	#timestamp: string;

	constructor(platform: string, type: string, description: string, url: string, timestamp: string) {
		this.#platform = platform;
		this.#type = type;
		this.#description = description;
		this.#url = url;
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

	static import(source: any, name: string = "[source]"): UserActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const type = String.import(Reflect.get(object, "type"), `${name}.type`);
		const description = String.import(Reflect.get(object, "description"), `${name}.description`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const timestamp = String.import(Reflect.get(object, "timestamp"), `${name}.timestamp`);
		const result = new UserActivity(platform, type, description, url, timestamp);
		return result;
	}

	static export(source: UserActivity): UserActivityScheme {
		const platform = source.#platform;
		const type = source.#type;
		const description = source.#description;
		const url = source.#url;
		const timestamp = source.#timestamp;
		return { platform, type, description, url, timestamp };
	}
}
//#endregion

export { UserActivity };
