"use strict";

import "adaptive-extender/core";

//#region Activity
export interface ActivityDiscriminator extends GitHubActivityDiscriminator, SpotifyActivityDiscriminator {
}

export interface ActivityScheme {
	$type: keyof ActivityDiscriminator;
	platform: string;
	timestamp: number;
}

export class Activity {
	#platform: string;
	#timestamp: Date;

	constructor(platform: string, timestamp: Date) {
		if (new.target === Activity) throw new TypeError("Unable to create an instance of an abstract class");
		this.#platform = platform;
		this.#timestamp = timestamp;
	}

	static import(source: any, name: string): Activity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "GitHubPushActivity":
		case "GitHubWatchActivity":
		case "GitHubCreateTagActivity":
		case "GitHubCreateBranchActivity":
		case "GitHubCreateRepositoryActivity": return GitHubActivity.import(source, name);
		case "SpotifyLikeActivity": return SpotifyActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: Activity): ActivityScheme {
		if (source instanceof GitHubActivity) return GitHubActivity.export(source);
		if (source instanceof SpotifyActivity) return SpotifyActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}

	static earlier(first: Activity, second: Activity): number {
		return second.#timestamp.valueOf() - first.#timestamp.valueOf();
	}

	static isSame(first: Activity, second: Activity): boolean {
		if (first.#platform !== second.#platform) return false;
		if (first.#timestamp.valueOf() !== second.#timestamp.valueOf()) return false;
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
export interface GitHubActivityDiscriminator extends GitHubPushActivityDiscriminator, GitHubWatchActivityDiscriminator, GitHubCreateActivityDiscriminator {
}

export interface GitHubActivityScheme extends ActivityScheme {
	$type: keyof GitHubActivityDiscriminator;
	username: string;
	url: string;
	repository: string;
}

export class GitHubActivity extends Activity {
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

	static import(source: any, name: string): GitHubActivity {
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

	static import(source: any, name: string): GitHubPushActivity {
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

	static import(source: any, name: string): GitHubWatchActivity {
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
export interface GitHubCreateActivityDiscriminator extends GitHubCreateTagActivityDiscriminator, GitHubCreateBranchActivityDiscriminator, GitHubCreateRepositoryActivityDiscriminator {
}

export interface GitHubCreateActivityScheme extends GitHubActivityScheme {
	$type: keyof GitHubCreateActivityDiscriminator;
	name: string;
}

export class GitHubCreateActivity extends GitHubActivity {
	#name: string;

	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository);
		if (new.target === GitHubCreateActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.#name = name;
	}

	static import(source: any, name: string): GitHubCreateActivity {
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

//#region GitHub create tag activity
export interface GitHubCreateTagActivityDiscriminator {
	"GitHubCreateTagActivity": GitHubCreateTagActivity;
}

export interface GitHubCreateTagActivityScheme extends GitHubCreateActivityScheme {
	$type: keyof GitHubCreateTagActivityDiscriminator;
}

export class GitHubCreateTagActivity extends GitHubCreateActivity {
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository, name);
	}

	static import(source: any, name: string): GitHubCreateTagActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const username = String.import(Reflect.get(object, "username"), `${name}.username`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const repository = String.import(Reflect.get(object, "repository"), `${name}.repository`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const result = new GitHubCreateTagActivity(platform, timestamp, username, url, repository, $name);
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

//#region GitHub create branch activity
export interface GitHubCreateBranchActivityDiscriminator {
	"GitHubCreateBranchActivity": GitHubCreateBranchActivity;
}

export interface GitHubCreateBranchActivityScheme extends GitHubCreateActivityScheme {
	$type: keyof GitHubCreateBranchActivityDiscriminator;
}

export class GitHubCreateBranchActivity extends GitHubCreateActivity {
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository, name);
	}

	static import(source: any, name: string): GitHubCreateBranchActivity {
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

//#region GitHub create repository activity
export interface GitHubCreateRepositoryActivityDiscriminator {
	"GitHubCreateRepositoryActivity": GitHubCreateRepositoryActivity;
}

export interface GitHubCreateRepositoryActivityScheme extends GitHubCreateActivityScheme {
	$type: keyof GitHubCreateRepositoryActivityDiscriminator;
}

export class GitHubCreateRepositoryActivity extends GitHubCreateActivity {
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository, name);
	}

	static import(source: any, name: string): GitHubCreateRepositoryActivity {
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

//#region Spotify activity
export interface SpotifyActivityDiscriminator extends SpotifyLikeActivityDiscriminator {
}

export interface SpotifyActivityScheme extends ActivityScheme {
	$type: keyof SpotifyActivityDiscriminator;
}

export class SpotifyActivity extends Activity {
	constructor(platform: string, timestamp: Date) {
		super(platform, timestamp);
		if (new.target === SpotifyActivity) throw new TypeError("Unable to create an instance of an abstract class");
	}

	static import(source: any, name: string): SpotifyActivity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "SpotifyLikeActivity": return SpotifyLikeActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: SpotifyActivity): SpotifyActivityScheme {
		if (source instanceof SpotifyLikeActivity) return SpotifyLikeActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}
}
//#endregion

//#region Spotify like activity
export interface SpotifyLikeActivityDiscriminator {
	"SpotifyLikeActivity": SpotifyLikeActivity;
}

export interface SpotifyLikeActivityScheme extends SpotifyActivityScheme {
	$type: keyof SpotifyLikeActivityDiscriminator;
	title: string;
	artists: string[];
	cover: string | null;
	url: string;
}

export class SpotifyLikeActivity extends SpotifyActivity {
	#title: string;
	#artists: string[];
	#cover: string | null;
	#url: string;

	constructor(platform: string, timestamp: Date, title: string, artists: string[], cover: string | null, url: string) {
		super(platform, timestamp);
		this.#title = title;
		this.#artists = artists;
		this.#cover = cover;
		this.#url = url;
	}

	static import(source: any, name: string): SpotifyLikeActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const title = String.import(Reflect.get(object, "title"), `${name}.title`);
		const artists = Array.import(Reflect.get(object, "artists"), `${name}.artists`).map((item, index) => {
			return String.import(item, `${name}.artists[${index}]`);
		});
		const cover = Reflect.mapNull<unknown, null, string | null>(Reflect.get(object, "cover"), cover => String.import(cover, `${name}.cover`));
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const result = new SpotifyLikeActivity(platform, timestamp, title, artists, cover, url);
		return result;
	}

	static export(source: SpotifyLikeActivity): SpotifyLikeActivityScheme {
		const $type = "SpotifyLikeActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const title = source.title;
		const artists = source.artists;
		const cover = source.cover;
		const url = source.url;
		return { $type, platform, timestamp, title, artists, cover, url };
	}

	get title(): string {
		return this.#title;
	}

	get artists(): string[] {
		return this.#artists;
	}

	get cover(): string | null {
		return this.#cover;
	}

	get url(): string {
		return this.#url;
	}
}
//#endregion
