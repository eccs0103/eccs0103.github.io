"use strict";

import "adaptive-extender/core";
import { GitHubActivity, type GitHubActivityScheme } from "./github-activity.js";

//#region GitHub push activity
export interface GitHubPushActivityDiscriminator {
	"GitHubPushActivity": GitHubPushActivity;
}

export interface GitHubPushActivityScheme extends GitHubActivityScheme {
	$type: keyof GitHubPushActivityDiscriminator;
	sha: string;
}

export class GitHubPushActivity extends GitHubActivity {
	#sha: string;

	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, sha: string) {
		super(platform, timestamp, username, url, repository);
		this.#sha = sha;
	}

	static import(source: any, name: string = "[source]"): GitHubPushActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const username = String.import(Reflect.get(object, "username"), `${name}.username`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const repository = String.import(Reflect.get(object, "repository"), `${name}.repository`);
		const sha = String.import(Reflect.get(object, "sha"), `${name}.sha`);
		const result = new GitHubPushActivity(platform, timestamp, username, url, repository, sha);
		return result;
	}

	static export(source: GitHubPushActivity): GitHubPushActivityScheme {
		const $type = "GitHubPushActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const username = source.username;
		const url = source.url;
		const repository = source.repository;
		const sha = source.sha;
		return { $type, platform, timestamp, username, url, repository, sha };
	}

	get sha(): string {
		return this.#sha;
	}
}
//#endregion
