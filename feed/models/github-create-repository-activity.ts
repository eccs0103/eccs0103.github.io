"use strict";

import "adaptive-extender/core";
import { GitHubCreateActivity, type GitHubCreateActivityScheme } from "./github-create-activity.js";

//#region GitHub create repository activity
export interface GitHubCreateRepositoryActivitySchemeDiscriminator {
	"GitHubCreateRepositoryActivity": GitHubCreateRepositoryActivity;
}

export interface GitHubCreateRepositoryActivityScheme extends GitHubCreateActivityScheme {
	$type: keyof GitHubCreateRepositoryActivitySchemeDiscriminator;
}

export class GitHubCreateRepositoryActivity extends GitHubCreateActivity {
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository, name);
	}

	static import(source: any, name: string = "[source]"): GitHubCreateRepositoryActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const username = String.import(Reflect.get(object, "username"), `${name}.username`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const repository = String.import(Reflect.get(object, "repository"), `${name}.repository`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const result = new GitHubCreateRepositoryActivity(platform, timestamp, username, url, repository, $name);
		return result;
	}

	static export(source: GitHubCreateRepositoryActivity): GitHubCreateRepositoryActivityScheme {
		const $type = "GitHubCreateRepositoryActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const username = source.username;
		const url = source.url;
		const repository = source.repository;
		const name = source.name;
		return { $type, platform, timestamp, username, url, repository, name };
	}
}
//#endregion
