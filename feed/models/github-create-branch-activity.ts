"use strict";

import "adaptive-extender/core";
import { GitHubCreateActivity, type GitHubCreateActivityScheme } from "./github-create-activity.js";

//#region GitHub create branch activity
export interface GitHubCreateBranchActivitySchemeDiscriminator {
	"GitHubCreateBranchActivity": GitHubCreateBranchActivity;
}

export interface GitHubCreateBranchActivityScheme extends GitHubCreateActivityScheme {
	$type: keyof GitHubCreateBranchActivitySchemeDiscriminator;
}

export class GitHubCreateBranchActivity extends GitHubCreateActivity {
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository, name);
	}

	static import(source: any, name: string = "[source]"): GitHubCreateBranchActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const username = String.import(Reflect.get(object, "username"), `${name}.username`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const repository = String.import(Reflect.get(object, "repository"), `${name}.repository`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const result = new GitHubCreateBranchActivity(platform, timestamp, username, url, repository, $name);
		return result;
	}

	static export(source: GitHubCreateBranchActivity): GitHubCreateBranchActivityScheme {
		const $type = "GitHubCreateBranchActivity";
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
