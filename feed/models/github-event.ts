"use strict";

import "adaptive-extender/core";
import { Deferred, Descendant, Field, Model, Nullable, Optional, type Constructor } from "adaptive-extender/core";

//#region GitHub event actor
export interface GitHubEventActorScheme {
	id: number;
	login: string;
	display_login?: string;
	gravatar_id: string;
	url: string;
	avatar_url: string;
}

export class GitHubEventActor extends Model {
	@Field(Number, "id")
	id: number;

	@Field(String, "login")
	login: string;

	@Field(Optional(String), "display_login")
	displayLogin?: string;

	@Field(String, "gravatar_id")
	gravatarId: string;

	@Field(String, "url")
	url: string;

	@Field(String, "avatar_url")
	avatarUrl: string;
}
//#endregion

//#region GitHub event repository
export interface GitHubEventRepositoryScheme {
	id: number;
	name: string;
	url: string;
}

export class GitHubEventRepository extends Model {
	@Field(Number, "id")
	id: number;

	@Field(String, "name")
	name: string;

	@Field(String, "url")
	url: string;
}
//#endregion

//#region GitHub event release
export interface GitHubEventReleaseScheme {
	html_url: string;
	tag_name: string;
	name: string | null;
	draft: boolean;
	prerelease: boolean;
	published_at: string;
	body: string | null;
}

export class GitHubEventRelease extends Model {
	@Field(String, "html_url")
	htmlUrl: string;

	@Field(String, "tag_name")
	tagName: string;

	@Field(Nullable(String), "name")
	name: string | null;

	@Field(Boolean, "draft")
	draft: boolean;

	@Field(Boolean, "prerelease")
	prerelease: boolean;

	@Field(String, "published_at")
	publishedAt: string;

	@Field(Nullable(String), "body")
	body: string | null;
}
//#endregion

//#region GitHub push event payload
export interface GitHubPushEventPayloadDiscriminator {
	"PushEvent": any;
}

export interface GitHubPushEventPayloadScheme {
	$type: keyof GitHubPushEventPayloadDiscriminator;
	push_id: number;
	ref: string;
	head: string;
	before: string;
}

export class GitHubPushEventPayload extends Model {
	@Field(Number, "push_id")
	pushId: number;

	@Field(String, "ref")
	ref: string;

	@Field(String, "head")
	head: string;

	@Field(String, "before")
	before: string;
}
//#endregion

//#region GitHub release event payload
export interface GitHubReleaseEventPayloadDiscriminator {
	"ReleaseEvent": any;
}

export interface GitHubReleaseEventPayloadScheme {
	$type: keyof GitHubReleaseEventPayloadDiscriminator;
	action: string;
	release: GitHubEventReleaseScheme;
}

export class GitHubReleaseEventPayload extends Model {
	@Field(String, "action")
	action: string;

	@Field(GitHubEventRelease, "release")
	release: GitHubEventRelease;
}
//#endregion

//#region GitHub watch event payload
export interface GitHubWatchEventPayloadDiscriminator {
	"WatchEvent": any;
}

export interface GitHubWatchEventPayloadScheme {
	$type: keyof GitHubWatchEventPayloadDiscriminator;
	action: string;
}

export class GitHubWatchEventPayload extends Model {
	@Field(String, "action")
	action: string;
}
//#endregion

//#region GitHub create event payload
export interface GitHubCreateEventPayloadDiscriminator {
	"CreateEvent": any;
}

export interface GitHubCreateEventPayloadScheme {
	$type: keyof GitHubCreateEventPayloadDiscriminator;
	ref: string | null;
	ref_type: string;
	master_branch: string;
	description: string | null;
	pusher_type: string;
}

export class GitHubCreateEventPayload extends Model {
	@Field(Nullable(String), "ref")
	ref: string | null;

	@Field(String, "ref_type")
	refType: string;

	@Field(String, "master_branch")
	masterBranch: string;

	@Field(Nullable(String), "description")
	description: string | null;

	@Field(String, "pusher_type")
	pusherType: string;
}
//#endregion

//#region GitHub delete event payload
export interface GitHubDeleteEventPayloadDiscriminator {
	"DeleteEvent": any;
}

export interface GitHubDeleteEventPayloadScheme {
	$type: keyof GitHubDeleteEventPayloadDiscriminator;
	ref: string;
	ref_type: string;
	pusher_type: string;
}

export class GitHubDeleteEventPayload extends Model {
	@Field(String, "ref")
	ref: string;

	@Field(String, "ref_type")
	refType: string;

	@Field(String, "pusher_type")
	pusherType: string;
}
//#endregion

//#region GitHub event payload
export interface GitHubEventPayloadDiscriminator extends GitHubPushEventPayloadDiscriminator, GitHubReleaseEventPayloadDiscriminator, GitHubWatchEventPayloadDiscriminator, GitHubCreateEventPayloadDiscriminator, GitHubDeleteEventPayloadDiscriminator {
	"ForkEvent": any;
	"IssuesEvent": any;
	"PullRequestEvent": any;
}

export interface GitHubEventPayloadScheme {
	$type: keyof GitHubEventPayloadDiscriminator;
}

@Descendant(Deferred(_ => GitHubPushEventPayload), "PushEvent")
@Descendant(Deferred(_ => GitHubReleaseEventPayload), "ReleaseEvent")
@Descendant(Deferred(_ => GitHubWatchEventPayload), "WatchEvent")
@Descendant(Deferred(_ => GitHubCreateEventPayload), "CreateEvent")
@Descendant(Deferred(_ => GitHubDeleteEventPayload), "DeleteEvent")
export abstract class GitHubEventPayload extends Model {
}
//#endregion

//#region GitHub event
export interface GitHubEventDiscriminator extends GitHubEventPayloadDiscriminator {
}

export interface GitHubEventScheme {
	id: string;
	type: keyof GitHubEventDiscriminator;
	actor: GitHubEventActorScheme;
	repo: GitHubEventRepositoryScheme;
	public: boolean;
	created_at: string;
	payload: GitHubEventPayloadScheme;
}

export class GitHubEvent extends Model {
	@Field(String, "id")
	id: string;

	@Field(String, "type")
	type: string;

	@Field(GitHubEventActor, "actor")
	actor: GitHubEventActor;

	@Field(GitHubEventRepository, "repo")
	repo: GitHubEventRepository;

	@Field(Boolean, "public")
	public: boolean;

	@Field(Date, "created_at")
	createdAt: Date;

	@Field(GitHubEventPayload, "payload")
	payload: GitHubEventPayload;

	static import<I extends Model>(this: Constructor<I>, source: any, name: string): I {
		if (source && typeof source === "object" && "payload" in source && "type" in source) {
			source.payload.$type = source.type;
		}

		return super.import<I>(source, name);
	}
}
//#endregion
