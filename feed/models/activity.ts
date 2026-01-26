"use strict";

import "adaptive-extender/core";
import { ArrayOf, Deferred, Descendant, Field, Model, Nullable, Optional, Timestamp } from "adaptive-extender/core";

//#region Activity
export interface ActivityDiscriminator extends GitHubActivityDiscriminator, SpotifyActivityDiscriminator, PinterestActivityDiscriminator, SteamActivityDiscriminator, StackOverflowActivityDiscriminator {
}

export interface ActivityScheme {
	$type: keyof ActivityDiscriminator;
	platform: string;
	timestamp: number;
}

@Descendant(Deferred(_ => GitHubPushActivity))
@Descendant(Deferred(_ => GitHubReleaseActivity))
@Descendant(Deferred(_ => GitHubWatchActivity))
@Descendant(Deferred(_ => GitHubCreateTagActivity))
@Descendant(Deferred(_ => GitHubCreateBranchActivity))
@Descendant(Deferred(_ => GitHubCreateRepositoryActivity))
@Descendant(Deferred(_ => GitHubDeleteTagActivity))
@Descendant(Deferred(_ => GitHubDeleteBranchActivity))
@Descendant(Deferred(_ => SpotifyLikeActivity))
@Descendant(Deferred(_ => PinterestImagePinActivity))
@Descendant(Deferred(_ => PinterestVideoPinActivity))
@Descendant(Deferred(_ => SteamAchievementActivity))
@Descendant(Deferred(_ => SteamScreenshotActivity))
@Descendant(Deferred(_ => StackOverflowQuestionActivity))
@Descendant(Deferred(_ => StackOverflowAnswerActivity))
export abstract class Activity extends Model {
	@Field(String, "platform")
	platform: string;

	@Field(Timestamp, "timestamp")
	timestamp: Date;

	constructor();
	constructor(platform: string, timestamp: Date);
	constructor(platform?: string, timestamp?: Date) {
		if (platform === undefined || timestamp === undefined) {
			super();
			return;
		}

		super();
		if (new.target === Activity) throw new TypeError("Unable to create an instance of an abstract class");
		this.platform = platform;
		this.timestamp = timestamp;
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

@Descendant(Deferred(_ => GitHubPushActivity))
@Descendant(Deferred(_ => GitHubReleaseActivity))
@Descendant(Deferred(_ => GitHubWatchActivity))
@Descendant(Deferred(_ => GitHubCreateTagActivity))
@Descendant(Deferred(_ => GitHubCreateBranchActivity))
@Descendant(Deferred(_ => GitHubCreateRepositoryActivity))
@Descendant(Deferred(_ => GitHubDeleteTagActivity))
@Descendant(Deferred(_ => GitHubDeleteBranchActivity))
export abstract class GitHubActivity extends Activity {
	@Field(String, "username")
	username: string;

	@Field(String, "url")
	url: string;

	@Field(String, "repository")
	repository: string;

	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined) {
			super();
			return;
		}

		super(platform, timestamp);
		if (new.target === GitHubActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.username = username;
		this.url = url;
		this.repository = repository;
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
	@Field(String, "sha")
	sha: string;

	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, sha: string);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string, sha?: string) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined || sha === undefined) {
			super();
			return;
		}

		super(platform, timestamp, username, url, repository);
		this.sha = sha;
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
	tag_name: string;
	is_prerelease: boolean;
}

export class GitHubReleaseActivity extends GitHubActivity {
	@Field(String, "title")
	title: string;

	@Field(String, "tag_name")
	tagName: string;

	@Field(Boolean, "is_prerelease")
	isPrerelease: boolean;

	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, title: string, tagName: string, isPrerelease: boolean);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string, title?: string, tagName?: string, isPrerelease?: boolean) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined || title === undefined || tagName === undefined || isPrerelease === undefined) {
			super();
			return;
		}

		super(platform, timestamp, username, url, repository);
		this.title = title;
		this.tagName = tagName;
		this.isPrerelease = isPrerelease;
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
	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined) {
			super();
			return;
		}

		super(platform, timestamp, username, url, repository);
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

@Descendant(Deferred(_ => GitHubCreateTagActivity))
@Descendant(Deferred(_ => GitHubCreateBranchActivity))
@Descendant(Deferred(_ => GitHubCreateRepositoryActivity))
export abstract class GitHubCreateActivity extends GitHubActivity {
	@Field(String, "name")
	name: string;

	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string, name?: string) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined || name === undefined) {
			super();
			return;
		}

		super(platform, timestamp, username, url, repository);
		if (new.target === GitHubCreateActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.name = name;
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
	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string, name?: string) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined || name === undefined) {
			super();
			return;
		}

		super(platform, timestamp, username, url, repository, name);
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
	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string, name?: string) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined || name === undefined) {
			super();
			return;
		}

		super(platform, timestamp, username, url, repository, name);
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
	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string, name?: string) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined || name === undefined) {
			super();
			return;
		}

		super(platform, timestamp, username, url, repository, name);
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

@Descendant(Deferred(_ => GitHubDeleteTagActivity))
@Descendant(Deferred(_ => GitHubDeleteBranchActivity))
export abstract class GitHubDeleteActivity extends GitHubActivity {
	@Field(String, "name")
	name: string;

	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string, name?: string) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined || name === undefined) {
			super();
			return;
		}

		super(platform, timestamp, username, url, repository);
		if (new.target === GitHubDeleteActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.name = name;
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
	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string, name?: string) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined || name === undefined) {
			super();
			return;
		}

		super(platform, timestamp, username, url, repository, name);
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
	constructor();
	constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, name: string);
	constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string, name?: string) {
		if (platform === undefined || timestamp === undefined || username === undefined || url === undefined || repository === undefined || name === undefined) {
			super();
			return;
		}

		super(platform, timestamp, username, url, repository, name);
	}
}
//#endregion

//#region Spotify activity
export interface SpotifyActivityDiscriminator extends SpotifyLikeActivityDiscriminator {
}

export interface SpotifyActivityScheme extends ActivityScheme {
	$type: keyof SpotifyActivityDiscriminator;
}

@Descendant(Deferred(_ => SpotifyLikeActivity))
export abstract class SpotifyActivity extends Activity {
	constructor();
	constructor(platform: string, timestamp: Date);
	constructor(platform?: string, timestamp?: Date) {
		if (platform === undefined || timestamp === undefined) {
			super();
			return;
		}

		super(platform, timestamp);
		if (new.target === SpotifyActivity) throw new TypeError("Unable to create an instance of an abstract class");
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
	@Field(String, "title")
	title: string;

	@Field(ArrayOf(String), "artists")
	artists: string[];

	@Field(Nullable(String), "cover")
	cover: string | null;

	@Field(String, "url")
	url: string;

	constructor();
	constructor(platform: string, timestamp: Date, title: string, artists: string[], cover: string | null, url: string);
	constructor(platform?: string, timestamp?: Date, title?: string, artists?: string[], cover?: string | null, url?: string) {
		if (platform === undefined || timestamp === undefined || title === undefined || artists === undefined || cover === undefined || url === undefined) {
			super();
			return;
		}

		super(platform, timestamp);
		this.title = title;
		this.artists = artists;
		this.cover = cover;
		this.url = url;
	}
}
//#endregion

//#region Pinterest activity
export interface PinterestActivityDiscriminator extends PinterestPinActivityDiscriminator {
}

export interface PinterestActivityScheme extends ActivityScheme {
	$type: keyof PinterestActivityDiscriminator;
}

@Descendant(Deferred(_ => PinterestImagePinActivity))
@Descendant(Deferred(_ => PinterestVideoPinActivity))
export abstract class PinterestActivity extends Activity {
	constructor();
	constructor(platform: string, timestamp: Date);
	constructor(platform?: string, timestamp?: Date) {
		if (platform === undefined || timestamp === undefined) {
			super();
			return;
		}

		super(platform, timestamp);
		if (new.target === PinterestActivity) throw new TypeError("Unable to create an instance of an abstract class");
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

@Descendant(Deferred(_ => PinterestImagePinActivity))
@Descendant(Deferred(_ => PinterestVideoPinActivity))
export abstract class PinterestPinActivity extends PinterestActivity {
	@Field(String, "content")
	content: string;

	@Field(Number, "width")
	width: number;

	@Field(Number, "height")
	height: number;

	@Field(Nullable(String), "title")
	title: string | null;

	@Field(Nullable(String), "description")
	description: string | null;

	@Field(String, "board")
	board: string;

	@Field(String, "url")
	url: string;

	constructor();
	constructor(platform: string, timestamp: Date, content: string, width: number, height: number, title: string | null, description: string | null, board: string, url: string);
	constructor(platform?: string, timestamp?: Date, content?: string, width?: number, height?: number, title?: string | null, description?: string | null, board?: string, url?: string) {
		if (platform === undefined || timestamp === undefined || content === undefined || width === undefined || height === undefined || title === undefined || description === undefined || board === undefined || url === undefined) {
			super();
			return;
		}

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
	constructor();
	constructor(platform: string, timestamp: Date, content: string, width: number, height: number, title: string | null, description: string | null, board: string, url: string);
	constructor(platform?: string, timestamp?: Date, content?: string, width?: number, height?: number, title?: string | null, description?: string | null, board?: string, url?: string) {
		if (platform === undefined || timestamp === undefined || content === undefined || width === undefined || height === undefined || title === undefined || description === undefined || board === undefined || url === undefined) {
			super();
			return;
		}

		super(platform, timestamp, content, width, height, title, description, board, url);
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
	constructor();
	constructor(platform: string, timestamp: Date, content: string, width: number, height: number, title: string | null, description: string | null, board: string, url: string);
	constructor(platform?: string, timestamp?: Date, content?: string, width?: number, height?: number, title?: string | null, description?: string | null, board?: string, url?: string) {
		if (platform === undefined || timestamp === undefined || content === undefined || width === undefined || height === undefined || title === undefined || description === undefined || board === undefined || url === undefined) {
			super();
			return;
		}

		super(platform, timestamp, content, width, height, title, description, board, url);
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

@Descendant(Deferred(_ => SteamAchievementActivity))
@Descendant(Deferred(_ => SteamScreenshotActivity))
export abstract class SteamActivity extends Activity {
	@Field(String, "game")
	game: string;

	@Field(String, "webpage")
	webpage: string;

	constructor();
	constructor(platform: string, timestamp: Date, game: string, webpage: string);
	constructor(platform?: string, timestamp?: Date, game?: string, webpage?: string) {
		if (platform === undefined || timestamp === undefined || game === undefined || webpage === undefined) {
			super();
			return;
		}

		super(platform, timestamp);
		if (new.target === SteamActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.game = game;
		this.webpage = webpage;
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
	@Field(Nullable(String), "icon")
	icon: string | null;

	@Field(String, "title")
	title: string;

	@Field(Nullable(String), "description")
	description: string | null;

	@Field(String, "url")
	url: string;

	constructor();
	constructor(platform: string, timestamp: Date, game: string, webpage: string, icon: string | null, title: string, description: string | null, url: string);
	constructor(platform?: string, timestamp?: Date, game?: string, webpage?: string, icon?: string | null, title?: string, description?: string | null, url?: string) {
		if (platform === undefined || timestamp === undefined || game === undefined || webpage === undefined || icon === undefined || title === undefined || description === undefined || url === undefined) {
			super();
			return;
		}

		super(platform, timestamp, game, webpage);
		this.icon = icon;
		this.title = title;
		this.description = description;
		this.url = url;
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
	@Field(String, "url")
	url: string;

	@Field(Nullable(String), "title")
	title: string | null;

	constructor();
	constructor(platform: string, timestamp: Date, game: string, webpage: string, url: string, title: string | null);
	constructor(platform?: string, timestamp?: Date, game?: string, webpage?: string, url?: string, title?: string | null) {
		if (platform === undefined || timestamp === undefined || game === undefined || webpage === undefined || url === undefined || title === undefined) {
			super();
			return;
		}

		super(platform, timestamp, game, webpage);
		this.url = url;
		this.title = title;
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

@Descendant(Deferred(_ => StackOverflowQuestionActivity))
@Descendant(Deferred(_ => StackOverflowAnswerActivity))
export abstract class StackOverflowActivity extends Activity {
	@Field(String, "title")
	title: string;

	@Field(String, "body")
	body: string;

	@Field(Number, "score")
	score: number;

	@Field(String, "url")
	url: string;

	constructor();
	constructor(platform: string, timestamp: Date, title: string, body: string, score: number, url: string);
	constructor(platform?: string, timestamp?: Date, title?: string, body?: string, score?: number, url?: string) {
		if (platform === undefined || timestamp === undefined || title === undefined || body === undefined || score === undefined || url === undefined) {
			super();
			return;
		}

		super(platform, timestamp);
		if (new.target === StackOverflowActivity) throw new TypeError("Unable to create an instance of an abstract class");
		this.title = title;
		this.body = body;
		this.score = score;
		this.url = url;
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
	@Field(ArrayOf(String), "tags")
	tags: string[];

	@Field(Number, "views")
	views: number;

	@Field(Boolean, "is_answered")
	isAnswered: boolean;

	constructor();
	constructor(platform: string, timestamp: Date, title: string, body: string, score: number, url: string, tags: string[], views: number, isAnswered: boolean);
	constructor(platform?: string, timestamp?: Date, title?: string, body?: string, score?: number, url?: string, tags?: string[], views?: number, isAnswered?: boolean) {
		if (platform === undefined || timestamp === undefined || title === undefined || body === undefined || score === undefined || url === undefined || tags === undefined || views === undefined || isAnswered === undefined) {
			super();
			return;
		}

		super(platform, timestamp, title, body, score, url);
		this.tags = tags;
		this.views = views;
		this.isAnswered = isAnswered;
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
	@Field(Boolean, "is_accepted")
	isAccepted: boolean;

	constructor();
	constructor(platform: string, timestamp: Date, title: string, body: string, score: number, url: string, isAccepted: boolean);
	constructor(platform?: string, timestamp?: Date, title?: string, body?: string, score?: number, url?: string, isAccepted?: boolean) {
		if (platform === undefined || timestamp === undefined || title === undefined || body === undefined || score === undefined || url === undefined || isAccepted === undefined) {
			super();
			return;
		}
		
		super(platform, timestamp, title, body, score, url);
		this.isAccepted = isAccepted;
	}
}
//#endregion
