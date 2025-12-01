"use strict";

import "adaptive-extender/core";
import { GitHubActivity, type GitHubActivityDiscriminator } from "./github-activity.js";

//#region Activity
export interface ActivityDiscriminator extends GitHubActivityDiscriminator {
}

export interface ActivityScheme {
	$type: keyof ActivityDiscriminator;
	platform: string;
	timestamp: number;
}

export abstract class Activity {
	#platform: string;
	#timestamp: Date;

	constructor(platform: string, timestamp: Date) {
		if (new.target === Activity) throw new TypeError("Unable to create an instance of an abstract class");
		this.#platform = platform;
		this.#timestamp = timestamp;
	}

	static import(source: any, name: string = "[source]"): Activity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "GitHubPushActivity":
		case "GitHubWatchActivity":
		case "GitHubCreateTagActivity":
		case "GitHubCreateBranchActivity":
		case "GitHubCreateRepositoryActivity": return GitHubActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: Activity): ActivityScheme {
		if (source instanceof GitHubActivity) return GitHubActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}

	static earlier(first: Activity, second: Activity): number {
		return second.#timestamp.valueOf() - first.#timestamp.valueOf();
	}

	static isSame(first: Activity, second: Activity): boolean {
		if (first.#platform !== second.#platform) return false;
		if (first.#timestamp !== second.#timestamp) return false;
		return true;
	}

	get platform(): string {
		return this.#platform;
	}

	get timestamp(): Date {
		return this.#timestamp;
	}
}
//#endregion
