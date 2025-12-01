"use strict";

import "adaptive-extender/core";
import { GitHubActivity, type GitHubActivityScheme } from "./github-activity.js";

//#region GitHub watch activity
export interface GitHubWatchActivityDiscriminator {
	"GitHubWatchActivity": GitHubWatchActivity;
}

export interface GitHubWatchActivityScheme extends GitHubActivityScheme {
	$type: keyof GitHubWatchActivityDiscriminator;
}

export class GitHubWatchActivity extends GitHubActivity {
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string) {
		super(platform, timestamp, username, url, repository);
	}

	static import(source: any, name: string = "[source]"): GitHubWatchActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const username = String.import(Reflect.get(object, "username"), `${name}.username`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const repository = String.import(Reflect.get(object, "repository"), `${name}.repository`);
		const result = new GitHubWatchActivity(platform, timestamp, username, url, repository);
		return result;
	}

	static export(source: GitHubWatchActivity): GitHubWatchActivityScheme {
		const $type = "GitHubWatchActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const username = source.username;
		const url = source.url;
		const repository = source.repository;
		return { $type, platform, timestamp, username, url, repository };
	}
}
//#endregion
