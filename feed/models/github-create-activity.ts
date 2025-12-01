"use strict";

import "adaptive-extender/core";
import { GitHubActivity, type GitHubActivityScheme } from "./github-activity.js";
import { GitHubCreateTagActivity, type GitHubCreateTagActivitySchemeDiscriminator as GitHubCreateTagActivityDiscriminator } from "./github-create-tag-activity.js";
import { GitHubCreateBranchActivity, type GitHubCreateBranchActivitySchemeDiscriminator as GitHubCreateBranchActivityDiscriminator } from "./github-create-branch-activity.js";
import { GitHubCreateRepositoryActivity, type GitHubCreateRepositoryActivitySchemeDiscriminator as GitHubCreateRepositoryActivityDiscriminator } from "./github-create-repository-activity.js";

//#region GitHub create activity
export interface GitHubCreateActivityDiscriminator extends GitHubCreateTagActivityDiscriminator, GitHubCreateBranchActivityDiscriminator, GitHubCreateRepositoryActivityDiscriminator {
}

export interface GitHubCreateActivityScheme extends GitHubActivityScheme {
	$type: keyof GitHubCreateActivityDiscriminator;
	name: string;
}

export abstract class GitHubCreateActivity extends GitHubActivity {
	#name: string;

	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository);
		if (new.target === GitHubCreateActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.#name = name;
	}

	static import(source: any, name: string = "[source]"): GitHubCreateActivity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`) as keyof GitHubCreateActivityDiscriminator;
		switch ($type) {
		case "GitHubCreateTagActivity": return GitHubCreateTagActivity.import(source, name);
		case "GitHubCreateBranchActivity": return GitHubCreateBranchActivity.import(source, name);
		case "GitHubCreateRepositoryActivity": return GitHubCreateRepositoryActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: GitHubCreateActivity): GitHubCreateActivityScheme {
		if (source instanceof GitHubCreateTagActivity) return GitHubCreateTagActivity.export(source);
		if (source instanceof GitHubCreateBranchActivity) return GitHubCreateBranchActivity.export(source);
		if (source instanceof GitHubCreateRepositoryActivity) return GitHubCreateRepositoryActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}

	get name(): string {
		return this.#name;
	}
}
//#endregion
