"use strict";

import "adaptive-extender/core";
import { Activity, type ActivityScheme } from "./activity.js";
import { GitHubPushActivity, type GitHubPushActivityDiscriminator } from "./github-push-activity.js";
import { GitHubWatchActivity, type GitHubWatchActivityDiscriminator } from "./github-watch-activity.js";
import { GitHubCreateActivity, type GitHubCreateActivityDiscriminator } from "./github-create-activity.js";

//#region GitHub activity
export interface GitHubActivityDiscriminator extends GitHubPushActivityDiscriminator, GitHubWatchActivityDiscriminator, GitHubCreateActivityDiscriminator {
}

export interface GitHubActivityScheme extends ActivityScheme {
	$type: keyof GitHubActivityDiscriminator;
	username: string;
	url: string;
	repository: string;
}

export abstract class GitHubActivity extends Activity {
	#username: string;
	#url: string;
	#repository: string;

	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string) {
		super(platform, timestamp);
		if (new.target === GitHubActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.#username = username;
		this.#url = url;
		this.#repository = repository;
	}

	static import(source: any, name: string = "[source]"): GitHubActivity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "GitHubPushActivity": return GitHubPushActivity.import(source, name);
		case "GitHubWatchActivity": return GitHubWatchActivity.import(source, name);
		case "GitHubCreateTagActivity":
		case "GitHubCreateBranchActivity":
		case "GitHubCreateRepositoryActivity": return GitHubCreateActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: GitHubActivity): GitHubActivityScheme {
		if (source instanceof GitHubPushActivity) return GitHubPushActivity.export(source);
		if (source instanceof GitHubWatchActivity) return GitHubWatchActivity.export(source);
		if (source instanceof GitHubCreateActivity) return GitHubCreateActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}

	get username(): string {
		return this.#username;
	}

	get url(): string {
		return this.#url;
	}

	get repository(): string {
		return this.#repository;
	}
}
//#endregion
