"use strict";

import "adaptive-extender/core";

//#region Activity
export interface ActivityDiscriminator extends GitHubActivityDiscriminator, SpotifyActivityDiscriminator, PinterestActivityDiscriminator, SteamActivityDiscriminator, StackOverflowActivityDiscriminator {
}

export interface ActivityScheme {
	$type: keyof ActivityDiscriminator;
	platform: string;
	timestamp: number;
}

export abstract class Activity {
	platform: string;
	timestamp: Date;

	constructor(platform: string, timestamp: Date) {
		if (new.target === Activity) throw new TypeError("Unable to create an instance of an abstract class");
		this.platform = platform;
		this.timestamp = timestamp;
	}

	static import(source: any, name: string): Activity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "GitHubPushActivity":
		case "GitHubReleaseActivity":
		case "GitHubWatchActivity":
		case "GitHubCreateTagActivity":
		case "GitHubCreateBranchActivity":
		case "GitHubCreateRepositoryActivity":
		case "GitHubDeleteTagActivity":
		case "GitHubDeleteBranchActivity": return GitHubActivity.import(source, name);
		case "SpotifyLikeActivity": return SpotifyActivity.import(source, name);
		case "PinterestImagePinActivity":
		case "PinterestVideoPinActivity": return PinterestActivity.import(source, name);
		case "SteamAchievementActivity":
		case "SteamScreenshotActivity": return SteamActivity.import(source, name);
		case "StackOverflowQuestionActivity":
		case "StackOverflowAnswerActivity": return StackOverflowActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: Activity): ActivityScheme {
		if (source instanceof GitHubActivity) return GitHubActivity.export(source);
		if (source instanceof SpotifyActivity) return SpotifyActivity.export(source);
		if (source instanceof PinterestActivity) return PinterestActivity.export(source);
		if (source instanceof SteamActivity) return SteamActivity.export(source);
		if (source instanceof StackOverflowActivity) return StackOverflowActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}

	static earlier(first: Activity, second: Activity): number {
		return second.timestamp.valueOf() - first.timestamp.valueOf();
	}

	static isSame(first: Activity, second: Activity): boolean {
		if (first.platform !== second.platform) return false;
		if (first.timestamp.valueOf() !== second.timestamp.valueOf()) return false;
		return true;
	}
}
//#endregion

//#region GitHub activity
export interface GitHubActivityDiscriminator extends GitHubPushActivityDiscriminator, GitHubReleaseActivityDiscriminator, GitHubWatchActivityDiscriminator, GitHubCreateActivityDiscriminator, GitHubDeleteActivityDiscriminator {
}

export interface GitHubActivityScheme extends ActivityScheme {
	$type: keyof GitHubActivityDiscriminator;
	username: string;
	url: string;
	repository: string;
}

export abstract class GitHubActivity extends Activity {
	username: string;
	url: string;
	repository: string;

	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string) {
		super(platform, timestamp);
		if (new.target === GitHubActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.username = username;
		this.url = url;
		this.repository = repository;
	}

	static import(source: any, name: string): GitHubActivity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "GitHubPushActivity": return GitHubPushActivity.import(source, name);
		case "GitHubReleaseActivity": return GitHubReleaseActivity.import(source, name);
		case "GitHubWatchActivity": return GitHubWatchActivity.import(source, name);
		case "GitHubCreateTagActivity":
		case "GitHubCreateBranchActivity":
		case "GitHubCreateRepositoryActivity": return GitHubCreateActivity.import(source, name);
		case "GitHubDeleteTagActivity":
		case "GitHubDeleteBranchActivity": return GitHubDeleteActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: GitHubActivity): GitHubActivityScheme {
		if (source instanceof GitHubPushActivity) return GitHubPushActivity.export(source);
		if (source instanceof GitHubReleaseActivity) return GitHubReleaseActivity.export(source);
		if (source instanceof GitHubWatchActivity) return GitHubWatchActivity.export(source);
		if (source instanceof GitHubCreateActivity) return GitHubCreateActivity.export(source);
		if (source instanceof GitHubDeleteActivity) return GitHubDeleteActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
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
	sha: string;

	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, sha: string) {
		super(platform, timestamp, username, url, repository);
		this.sha = sha;
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
}
//#endregion
//#region GitHub release activity
export interface GitHubReleaseActivityDiscriminator {
	"GitHubReleaseActivity": GitHubReleaseActivity;
}

export interface GitHubReleaseActivityScheme extends GitHubActivityScheme {
	$type: keyof GitHubReleaseActivityDiscriminator;
	title: string;
	is_prerelease: boolean;
}

export class GitHubReleaseActivity extends GitHubActivity {
	title: string;
	isPrerelease: boolean;

	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, title: string, isPrerelease: boolean) {
		super(platform, timestamp, username, url, repository);
		this.title = title;
		this.isPrerelease = isPrerelease;
	}

	static import(source: any, name: string): GitHubReleaseActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const username = String.import(Reflect.get(object, "username"), `${name}.username`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const repository = String.import(Reflect.get(object, "repository"), `${name}.repository`);
		const title = String.import(Reflect.get(object, "title"), `${name}.title`);
		const isPrerelease = Boolean.import(Reflect.get(object, "is_prerelease"), `${name}.is_prerelease`);
		const result = new GitHubReleaseActivity(platform, timestamp, username, url, repository, title, isPrerelease);
		return result;
	}

	static export(source: GitHubReleaseActivity): GitHubReleaseActivityScheme {
		const $type = "GitHubReleaseActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const username = source.username;
		const url = source.url;
		const repository = source.repository;
		const title = source.title;
		const is_prerelease = source.isPrerelease;
		return { $type, platform, timestamp, username, url, repository, title, is_prerelease };
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

export abstract class GitHubCreateActivity extends GitHubActivity {
	name: string;

	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository);
		if (new.target === GitHubCreateActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.name = name;
	}

	static import(source: any, name: string): GitHubCreateActivity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
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
//#region GitHub delete activity
export interface GitHubDeleteActivityDiscriminator extends GitHubDeleteTagActivityDiscriminator, GitHubDeleteBranchActivityDiscriminator {
}

export interface GitHubDeleteActivityScheme extends GitHubActivityScheme {
	$type: keyof GitHubDeleteActivityDiscriminator;
	name: string;
}

export abstract class GitHubDeleteActivity extends GitHubActivity {
	name: string;

	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository);
		if (new.target === GitHubDeleteActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.name = name;
	}

	static import(source: any, name: string): GitHubDeleteActivity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "GitHubDeleteTagActivity": return GitHubDeleteTagActivity.import(source, name);
		case "GitHubDeleteBranchActivity": return GitHubDeleteBranchActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: GitHubDeleteActivity): GitHubDeleteActivityScheme {
		if (source instanceof GitHubDeleteTagActivity) return GitHubDeleteTagActivity.export(source);
		if (source instanceof GitHubDeleteBranchActivity) return GitHubDeleteBranchActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}
}
//#endregion
//#region GitHub delete tag activity
export interface GitHubDeleteTagActivityDiscriminator {
	"GitHubDeleteTagActivity": GitHubDeleteTagActivity;
}

export interface GitHubDeleteTagActivityScheme extends GitHubDeleteActivityScheme {
	$type: keyof GitHubDeleteTagActivityDiscriminator;
}

export class GitHubDeleteTagActivity extends GitHubDeleteActivity {
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository, name);
	}

	static import(source: any, name: string): GitHubDeleteTagActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const username = String.import(Reflect.get(object, "username"), `${name}.username`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const repository = String.import(Reflect.get(object, "repository"), `${name}.repository`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const result = new GitHubDeleteTagActivity(platform, timestamp, username, url, repository, $name);
		return result;
	}

	static export(source: GitHubDeleteTagActivity): GitHubDeleteTagActivityScheme {
		const $type = "GitHubDeleteTagActivity";
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
//#region GitHub delete branch activity
export interface GitHubDeleteBranchActivityDiscriminator {
	"GitHubDeleteBranchActivity": GitHubDeleteBranchActivity;
}

export interface GitHubDeleteBranchActivityScheme extends GitHubDeleteActivityScheme {
	$type: keyof GitHubDeleteBranchActivityDiscriminator;
}

export class GitHubDeleteBranchActivity extends GitHubDeleteActivity {
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string) {
		super(platform, timestamp, username, url, repository, name);
	}

	static import(source: any, name: string): GitHubDeleteBranchActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const username = String.import(Reflect.get(object, "username"), `${name}.username`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const repository = String.import(Reflect.get(object, "repository"), `${name}.repository`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const result = new GitHubDeleteBranchActivity(platform, timestamp, username, url, repository, $name);
		return result;
	}

	static export(source: GitHubDeleteBranchActivity): GitHubDeleteBranchActivityScheme {
		const $type = "GitHubDeleteBranchActivity";
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

export abstract class SpotifyActivity extends Activity {
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
	title: string;
	artists: string[];
	cover: string | null;
	url: string;

	constructor(platform: string, timestamp: Date, title: string, artists: string[], cover: string | null, url: string) {
		super(platform, timestamp);
		this.title = title;
		this.artists = artists;
		this.cover = cover;
		this.url = url;
	}

	static import(source: any, name: string): SpotifyLikeActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const title = String.import(Reflect.get(object, "title"), `${name}.title`);
		const artists = Array.import(Reflect.get(object, "artists"), `${name}.artists`).map((item, index) => {
			return String.import(item, `${name}.artists[${index}]`);
		});
		const cover = Reflect.mapNull(Reflect.get(object, "cover") as unknown, cover => String.import(cover, `${name}.cover`));
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
}
//#endregion

//#region Pinterest activity
export interface PinterestActivityDiscriminator extends PinterestPinActivityDiscriminator {
}

export interface PinterestActivityScheme extends ActivityScheme {
	$type: keyof PinterestActivityDiscriminator;
}

export abstract class PinterestActivity extends Activity {
	constructor(platform: string, timestamp: Date) {
		super(platform, timestamp);
		if (new.target === PinterestActivity) throw new TypeError("Unable to create an instance of an abstract class");
	}

	static import(source: any, name: string): PinterestActivity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "PinterestImagePinActivity":
		case "PinterestVideoPinActivity": return PinterestPinActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: PinterestActivity): PinterestActivityScheme {
		if (source instanceof PinterestPinActivity) return PinterestPinActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}
}
//#endregion
//#region Pinterest pin activity
export interface PinterestPinActivityDiscriminator extends PinterestImagePinActivityDiscriminator, PinterestVideoPinActivityDiscriminator {
}

export interface PinterestPinActivityScheme extends PinterestActivityScheme {
	$type: keyof PinterestPinActivityDiscriminator;
	content: string;
	width: number;
	height: number;
	title: string | null;
	description: string | null;
	board: string;
	url: string;
}

export abstract class PinterestPinActivity extends PinterestActivity {
	content: string;
	width: number;
	height: number;
	title: string | null;
	description: string | null;
	board: string;
	url: string;

	constructor(platform: string, timestamp: Date, content: string, width: number, height: number, title: string | null, description: string | null, board: string, url: string) {
		super(platform, timestamp);
		if (new.target === PinterestPinActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.content = content;
		this.width = width;
		this.height = height;
		this.title = title;
		this.description = description;
		this.board = board;
		this.url = url;
	}

	static import(source: any, name: string): PinterestPinActivity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "PinterestImagePinActivity": return PinterestImagePinActivity.import(source, name);
		case "PinterestVideoPinActivity": return PinterestVideoPinActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: PinterestPinActivity): PinterestPinActivityScheme {
		if (source instanceof PinterestImagePinActivity) return PinterestImagePinActivity.export(source);
		if (source instanceof PinterestVideoPinActivity) return PinterestVideoPinActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}
}
//#endregion
//#region Pinterest image pin activity
export interface PinterestImagePinActivityDiscriminator {
	"PinterestImagePinActivity": PinterestImagePinActivity;
}

export interface PinterestImagePinActivityScheme extends PinterestPinActivityScheme {
	$type: keyof PinterestImagePinActivityDiscriminator;
}

export class PinterestImagePinActivity extends PinterestPinActivity {
	constructor(platform: string, timestamp: Date, content: string, width: number, height: number, title: string | null, description: string | null, board: string, url: string) {
		super(platform, timestamp, content, width, height, title, description, board, url);
	}

	static import(source: any, name: string): PinterestImagePinActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const content = String.import(Reflect.get(object, "content"), `${name}.content`);
		const width = Number.import(Reflect.get(object, "width"), `${name}.width`);
		const height = Number.import(Reflect.get(object, "height"), `${name}.height`);
		const title = Reflect.mapNull(Reflect.get(object, "title") as unknown, title => String.import(title, `${name}.title`));
		const description = Reflect.mapNull(Reflect.get(object, "description") as unknown, description => String.import(description, `${name}.description`));
		const board = String.import(Reflect.get(object, "board"), `${name}.board`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const result = new PinterestImagePinActivity(platform, timestamp, content, width, height, title, description, board, url);
		return result;
	}

	static export(source: PinterestImagePinActivity): PinterestImagePinActivityScheme {
		const $type = "PinterestImagePinActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const content = source.content;
		const width = source.width;
		const height = source.height;
		const title = source.title;
		const description = source.description;
		const board = source.board;
		const url = source.url;
		return { $type, platform, timestamp, content, width, height, title, description, board, url };
	}
}
//#endregion
//#region Pinterest video pin activity
export interface PinterestVideoPinActivityDiscriminator {
	"PinterestVideoPinActivity": PinterestVideoPinActivity;
}

export interface PinterestVideoPinActivityScheme extends PinterestPinActivityScheme {
	$type: keyof PinterestVideoPinActivityDiscriminator;
}

export class PinterestVideoPinActivity extends PinterestPinActivity {
	constructor(platform: string, timestamp: Date, content: string, width: number, height: number, title: string | null, description: string | null, board: string, url: string) {
		super(platform, timestamp, content, width, height, title, description, board, url);
	}

	static import(source: any, name: string): PinterestVideoPinActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const content = String.import(Reflect.get(object, "content"), `${name}.content`);
		const width = Number.import(Reflect.get(object, "width"), `${name}.width`);
		const height = Number.import(Reflect.get(object, "height"), `${name}.height`);
		const title = Reflect.mapNull(Reflect.get(object, "title") as unknown, title => String.import(title, `${name}.title`));
		const description = Reflect.mapNull(Reflect.get(object, "description") as unknown, description => String.import(description, `${name}.description`));
		const board = String.import(Reflect.get(object, "board"), `${name}.board`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const result = new PinterestVideoPinActivity(platform, timestamp, content, width, height, title, description, board, url);
		return result;
	}

	static export(source: PinterestVideoPinActivity): PinterestVideoPinActivityScheme {
		const $type = "PinterestVideoPinActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const content = source.content;
		const width = source.width;
		const height = source.height;
		const title = source.title;
		const description = source.description;
		const board = source.board;
		const url = source.url;
		return { $type, platform, timestamp, content, width, height, title, description, board, url };
	}
}
//#endregion

//#region Steam activity
export interface SteamActivityDiscriminator extends SteamAchievementActivityDiscriminator, SteamScreenshotActivityDiscriminator {
}

export interface SteamActivityScheme extends ActivityScheme {
	$type: keyof SteamActivityDiscriminator;
	game: string;
	webpage: string;
}

export abstract class SteamActivity extends Activity {
	game: string;
	webpage: string;

	constructor(platform: string, timestamp: Date, game: string, webpage: string) {
		super(platform, timestamp);
		if (new.target === SteamActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.game = game;
		this.webpage = webpage;
	}

	static import(source: any, name: string): SteamActivity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "SteamAchievementActivity": return SteamAchievementActivity.import(source, name);
		case "SteamScreenshotActivity": return SteamScreenshotActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: SteamActivity): SteamActivityScheme {
		if (source instanceof SteamAchievementActivity) return SteamAchievementActivity.export(source);
		if (source instanceof SteamScreenshotActivity) return SteamScreenshotActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}
}
//#endregion
//#region Steam achievement activity
export interface SteamAchievementActivityDiscriminator {
	"SteamAchievementActivity": SteamAchievementActivity;
}

export interface SteamAchievementActivityScheme extends SteamActivityScheme {
	$type: keyof SteamAchievementActivityDiscriminator;
	icon: string | null;
	title: string;
	description: string | null;
	url: string;
}

export class SteamAchievementActivity extends SteamActivity {
	icon: string | null;
	title: string;
	description: string | null;
	url: string;

	constructor(platform: string, timestamp: Date, game: string, webpage: string, icon: string | null, title: string, description: string | null, url: string) {
		super(platform, timestamp, game, webpage);
		this.icon = icon;
		this.title = title;
		this.description = description;
		this.url = url;
	}

	static import(source: any, name: string): SteamAchievementActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const game = String.import(Reflect.get(object, "game"), `${name}.game`);
		const webpage = String.import(Reflect.get(object, "webpage"), `${name}.webpage`);
		const icon = Reflect.mapNull(Reflect.get(object, "icon") as unknown, icon => String.import(icon, `${name}.icon`));
		const title = String.import(Reflect.get(object, "title"), `${name}.title`);
		const description = Reflect.mapNull(Reflect.get(object, "description") as unknown, description => String.import(description, `${name}.description`));
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const result = new SteamAchievementActivity(platform, timestamp, game, webpage, icon, title, description, url);
		return result;
	}

	static export(source: SteamAchievementActivity): SteamAchievementActivityScheme {
		const $type = "SteamAchievementActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const game = source.game;
		const webpage = source.webpage;
		const icon = source.icon;
		const title = source.title;
		const description = source.description;
		const url = source.url;
		return { $type, platform, timestamp, game, webpage, icon, title, description, url };
	}
}
//#endregion
//#region Steam screenshot activity
export interface SteamScreenshotActivityDiscriminator {
	"SteamScreenshotActivity": SteamScreenshotActivity;
}

export interface SteamScreenshotActivityScheme extends SteamActivityScheme {
	$type: keyof SteamScreenshotActivityDiscriminator;
	url: string;
	title: string | null;
}

export class SteamScreenshotActivity extends SteamActivity {
	url: string;
	title: string | null;

	constructor(platform: string, timestamp: Date, game: string, webpage: string, url: string, title: string | null) {
		super(platform, timestamp, game, webpage);
		this.url = url;
		this.title = title;
	}

	static import(source: any, name: string): SteamScreenshotActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const game = String.import(Reflect.get(object, "game"), `${name}.game`);
		const webpage = String.import(Reflect.get(object, "webpage"), `${name}.webpage`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const title = Reflect.mapNull(Reflect.get(object, "title") as unknown, title => String.import(title, `${name}.title`));
		const result = new SteamScreenshotActivity(platform, timestamp, game, webpage, url, title);
		return result;
	}

	static export(source: SteamScreenshotActivity): SteamScreenshotActivityScheme {
		const $type = "SteamScreenshotActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const game = source.game;
		const webpage = source.webpage;
		const url = source.url;
		const title = source.title;
		return { $type, platform, timestamp, game, webpage, url, title };
	}
}
//#endregion

//#region Stack overflow activity
export interface StackOverflowActivityDiscriminator extends StackOverflowQuestionActivityDiscriminator, StackOverflowAnswerActivityDiscriminator {
}

export interface StackOverflowActivityScheme extends ActivityScheme {
	$type: keyof StackOverflowActivityDiscriminator;
	title: string;
	body: string;
	score: number;
	url: string;
}

export abstract class StackOverflowActivity extends Activity {
	title: string;
	body: string;
	score: number;
	url: string;

	constructor(platform: string, timestamp: Date, title: string, body: string, score: number, url: string) {
		super(platform, timestamp);
		if (new.target === StackOverflowActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.title = title;
		this.body = body;
		this.score = score;
		this.url = url;
	}

	static import(source: any, name: string): StackOverflowActivity {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "StackOverflowQuestionActivity": return StackOverflowQuestionActivity.import(source, name);
		case "StackOverflowAnswerActivity": return StackOverflowAnswerActivity.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: StackOverflowActivity): StackOverflowActivityScheme {
		if (source instanceof StackOverflowQuestionActivity) return StackOverflowQuestionActivity.export(source);
		if (source instanceof StackOverflowAnswerActivity) return StackOverflowAnswerActivity.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}
}
//#endregion
//#region Stack overflow question activity
export interface StackOverflowQuestionActivityDiscriminator {
	"StackOverflowQuestionActivity": StackOverflowQuestionActivity;
}

export interface StackOverflowQuestionActivityScheme extends StackOverflowActivityScheme {
	$type: keyof StackOverflowQuestionActivityDiscriminator;
	tags: string[];
	views: number;
	is_answered: boolean;
}

export class StackOverflowQuestionActivity extends StackOverflowActivity {
	tags: string[];
	views: number;
	isAnswered: boolean;

	constructor(platform: string, timestamp: Date, title: string, body: string, score: number, url: string, tags: string[], views: number, isAnswered: boolean) {
		super(platform, timestamp, title, body, score, url);
		this.tags = tags;
		this.views = views;
		this.isAnswered = isAnswered;
	}

	static import(source: any, name: string): StackOverflowQuestionActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const title = String.import(Reflect.get(object, "title"), `${name}.title`);
		const body = String.import(Reflect.get(object, "body"), `${name}.body`);
		const score = Number.import(Reflect.get(object, "score"), `${name}.score`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const tags = Array.import(Reflect.get(object, "tags"), `${name}.tags`).map((item, index) => {
			return String.import(item, `${name}.tags[${index}]`);
		});
		const views = Number.import(Reflect.get(object, "views"), `${name}.views`);
		const isAnswered = Boolean.import(Reflect.get(object, "is_answered"), `${name}.is_answered`);
		const result = new StackOverflowQuestionActivity(platform, timestamp, title, body, score, url, tags, views, isAnswered);
		return result;
	}

	static export(source: StackOverflowQuestionActivity): StackOverflowQuestionActivityScheme {
		const $type = "StackOverflowQuestionActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const title = source.title;
		const body = source.body;
		const score = source.score;
		const url = source.url;
		const tags = source.tags;
		const views = source.views;
		const is_answered = source.isAnswered;
		return { $type, platform, timestamp, title, body, score, url, tags, views, is_answered };
	}
}
//#endregion
//#region Stack overflow answer activity
export interface StackOverflowAnswerActivityDiscriminator {
	"StackOverflowAnswerActivity": StackOverflowAnswerActivity;
}

export interface StackOverflowAnswerActivityScheme extends StackOverflowActivityScheme {
	$type: keyof StackOverflowAnswerActivityDiscriminator;
	is_accepted: boolean;
}

export class StackOverflowAnswerActivity extends StackOverflowActivity {
	isAccepted: boolean;

	constructor(platform: string, timestamp: Date, title: string, body: string, score: number, url: string, isAccepted: boolean) {
		super(platform, timestamp, title, body, score, url);
		this.isAccepted = isAccepted;
	}

	static import(source: any, name: string): StackOverflowAnswerActivity {
		const object = Object.import(source, name);
		const platform = String.import(Reflect.get(object, "platform"), `${name}.platform`);
		const timestamp = new Date(Number.import(Reflect.get(object, "timestamp"), `${name}.timestamp`));
		const title = String.import(Reflect.get(object, "title"), `${name}.title`);
		const body = String.import(Reflect.get(object, "body"), `${name}.body`);
		const score = Number.import(Reflect.get(object, "score"), `${name}.score`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const isAccepted = Boolean.import(Reflect.get(object, "is_accepted"), `${name}.is_accepted`);
		const result = new StackOverflowAnswerActivity(platform, timestamp, title, body, score, url, isAccepted);
		return result;
	}

	static export(source: StackOverflowAnswerActivity): StackOverflowAnswerActivityScheme {
		const $type = "StackOverflowAnswerActivity";
		const platform = source.platform;
		const timestamp = Number(source.timestamp);
		const title = source.title;
		const body = source.body;
		const score = source.score;
		const url = source.url;
		const is_accepted = source.isAccepted;
		return { $type, platform, timestamp, title, body, score, url, is_accepted };
	}
}
//#endregion
