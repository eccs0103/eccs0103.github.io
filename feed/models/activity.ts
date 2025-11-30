"use strict";

import "adaptive-extender/core";

//#region Activity
export interface ActivityScheme {
	$type: string;
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
		if ($type === "GitHubPushActivity") return GitHubActivity.import(source, name);
		throw new TypeError(`Invalid '${$type}' typename for ${name}`);
	}

	static export(source: Activity): ActivityScheme {
		if (source instanceof GitHubActivity) return GitHubActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' typename for source`);
	}

	static earlier(first: GitHubActivity, second: GitHubActivity): number {
		return second.#timestamp.valueOf() - first.#timestamp.valueOf();
	}

	static isSame(first: GitHubActivity, second: GitHubActivity): boolean {
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

//#region GitHub activity
export interface GitHubActivityScheme extends ActivityScheme {
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
		if ($type === "GitHubPushActivity") return GitHubPushActivity.import(source, name);
		throw new TypeError(`Invalid '${$type}' typename for ${name}`);
	}

	static export(source: GitHubActivity): GitHubActivityScheme {
		if (source instanceof GitHubPushActivity) return GitHubPushActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' typename for source`);
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

//#region GitHub push activity
export interface GitHubPushActivityScheme extends GitHubActivityScheme {
	$type: "GitHubPushActivity";
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
//#region GitHub watch activity
export interface GitHubWatchActivityScheme extends GitHubActivityScheme {
	$type: "GitHubWatchActivity";
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
//#region GitHub create activity
export interface GitHubCreateActivityScheme extends GitHubActivityScheme {
	$type: string;
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
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		if ($type === "GitHubCreateTagActivity") return GitHubCreateTagActivity.import(source, name);
		throw new TypeError(`Invalid '${$type}' typename for ${name}`);
	}

	static export(source: GitHubCreateActivity): GitHubCreateActivityScheme {
		if (source instanceof GitHubCreateTagActivity) return GitHubCreateTagActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' typename for source`);
	}

	get name(): string {
		return this.#name;
	}
}
//#endregion

//#region GitHub create activity
export interface GitHubCreateTagActivityScheme extends GitHubCreateActivityScheme {
	$type: "GitHubCreateTagActivity";
}

export class GitHubCreateTagActivity extends GitHubCreateActivity {
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository, name);
	}

	static import(source: any, name: string = "[source]"): GitHubCreateTagActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const username = String.import(Reflect.get(object, "username"), `${name}.username`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const repository = String.import(Reflect.get(object, "repository"), `${name}.repository`);
		const _name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const result = new GitHubCreateTagActivity(platform, timestamp, username, url, repository, _name);
		return result;
	}

	static export(source: GitHubCreateTagActivity): GitHubCreateTagActivityScheme {
		const $type = "GitHubCreateTagActivity";
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
//#region GitHub create activity
export interface GitHubCreateBranchActivityScheme extends GitHubCreateActivityScheme {
	$type: "GitHubCreateBranchActivity";
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
		const _name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const result = new GitHubCreateBranchActivity(platform, timestamp, username, url, repository, _name);
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
//#region GitHub create activity
export interface GitHubCreateRepositoryActivityScheme extends GitHubCreateActivityScheme {
	$type: "GitHubCreateRepositoryActivity";
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
		const _name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const result = new GitHubCreateRepositoryActivity(platform, timestamp, username, url, repository, _name);
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
