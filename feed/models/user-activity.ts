"use strict";

import "adaptive-extender/core";

//#region User activity
interface GitHubActivityScheme {
	platform: string;
	type: string;
	description: string;
	url: string;
	timestamp: number;
}

class GitHubActivity {
	#platform: string;
	#type: string;
	#description: string;
	#url: string;
	#timestamp: number;

	constructor(platform: string, type: string, description: string, url: string, timestamp: number) {
		this.#platform = platform;
		this.#type = type;
		this.#description = description;
		this.#url = url;
		this.#timestamp = timestamp;
	}

	static import(source: any, name: string = "[source]"): GitHubActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const type = String.import(Reflect.get(object, "type"), `${name}.type`);
		const description = String.import(Reflect.get(object, "description"), `${name}.description`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const timestamp = Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`);
		const result = new GitHubActivity(platform, type, description, url, timestamp);
		return result;
	}

	static export(source: GitHubActivity): GitHubActivityScheme {
		const platform = source.#platform;
		const type = source.#type;
		const description = source.#description;
		const url = source.#url;
		const timestamp = Number(source.#timestamp);
		return { platform, type, description, url, timestamp };
	}

	static earlier(first: GitHubActivity, second: GitHubActivity): number {
		return second.#timestamp - first.#timestamp;
	}

	static isSame(first: GitHubActivity, second: GitHubActivity): boolean {
		if (first.#platform !== second.#platform) return false;
		if (first.#timestamp !== second.#timestamp) return false;
		if (first.#description !== second.#description) return false;
		return true;
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

	get timestamp(): number {
		return this.#timestamp;
	}
}
//#endregion
