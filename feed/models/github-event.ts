"use strict";

import "adaptive-extender/core";

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

export class GitHubEvent {
	#id: string;
	#actor: GitHubEventActor;
	#repo: GitHubEventRepository;
	#public: boolean;
	#created_at: string;
	#payload: GitHubEventPayload;

	constructor(id: string, actor: GitHubEventActor, repo: GitHubEventRepository, $public: boolean, created_at: string, payload: GitHubEventPayload) {
		this.#id = id;
		this.#actor = actor;
		this.#repo = repo;
		this.#public = $public;
		this.#created_at = created_at;
		this.#payload = payload;
	}

	static import(source: any, name: string = "[source]"): GitHubEvent {
		const object = Object.import(source, name);
		const id = String.import(Reflect.get(object, "id"), `${name}.id`);
		const actor = GitHubEventActor.import(Reflect.get(object, "actor"), `${name}.actor`);
		const repo = GitHubEventRepository.import(Reflect.get(object, "repo"), `${name}.repo`);
		const $public = Boolean.import(Reflect.get(object, "public"), `${name}.public`);
		const created_at = String.import(Reflect.get(object, "created_at"), `${name}.created_at`);
		const type = String.import(Reflect.get(object, "type"), `${name}.type`);
		const payload = GitHubEventPayload.import(Object.assign(Object.import(Reflect.get(object, "payload"), `${name}.payload`), { [type]: type }), `${name}.payload`);
		const result = new GitHubEvent(id, actor, repo, $public, created_at, payload);
		return result;
	}

	static export(source: GitHubEvent): GitHubEventScheme {
		const id = source.id;
		const actor = GitHubEventActor.export(source.actor);
		const repo = GitHubEventRepository.export(source.repo);
		const $public = source.public;
		const created_at = source.created_at;
		const payload = GitHubEventPayload.export(source.payload);
		const type = payload.$type;
		return { id, type, actor, repo, public: $public, created_at, payload };
	}

	get id(): string {
		return this.#id;
	}

	get actor(): GitHubEventActor {
		return this.#actor;
	}

	get repo(): GitHubEventRepository {
		return this.#repo;
	}

	get public(): boolean {
		return this.#public;
	}

	get created_at(): string {
		return this.#created_at;
	}

	get payload(): GitHubEventPayload {
		return this.#payload;
	}
}
//#endregion

//#region GitHub event actor
export interface GitHubEventActorScheme {
	id: number;
	login: string;
	display_login?: string;
	gravatar_id: string;
	url: string;
	avatar_url: string;
}

export class GitHubEventActor {
	#id: number;
	#login: string;
	#display_login?: string;
	#gravatar_id: string;
	#url: string;
	#avatar_url: string;

	constructor(id: number, login: string, display_login: string | undefined, gravatar_id: string, url: string, avatar_url: string) {
		this.#id = id;
		this.#login = login;
		this.#display_login = display_login;
		this.#gravatar_id = gravatar_id;
		this.#url = url;
		this.#avatar_url = avatar_url;
	}

	static import(source: any, name: string = "[source]"): GitHubEventActor {
		const object = Object.import(source, name);
		const id = Number.import(Reflect.get(object, "id"), `${name}.id`);
		const login = String.import(Reflect.get(object, "login"), `${name}.login`);
		const display_login = Reflect.mapUndefined<unknown, undefined, string | undefined>(Reflect.get(object, "display_login"), display_login => String.import(display_login, `${name}.display_login`));
		const gravatar_id = String.import(Reflect.get(object, "gravatar_id"), `${name}.gravatar_id`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const avatar_url = String.import(Reflect.get(object, "avatar_url"), `${name}.avatar_url`);
		const result = new GitHubEventActor(id, login, display_login, gravatar_id, url, avatar_url);
		return result;
	}

	static export(source: GitHubEventActor): GitHubEventActorScheme {
		const id = source.id;
		const login = source.login;
		const display_login = source.display_login;
		const gravatar_id = source.gravatar_id;
		const url = source.url;
		const avatar_url = source.avatar_url;
		return { id, login, display_login, gravatar_id, url, avatar_url };
	}

	get id(): number {
		return this.#id;
	}

	get login(): string {
		return this.#login;
	}

	get display_login(): string | undefined {
		return this.#display_login;
	}

	get gravatar_id(): string {
		return this.#gravatar_id;
	}

	get url(): string {
		return this.#url;
	}

	get avatar_url(): string {
		return this.#avatar_url;
	}
}
//#endregion

//#region GitHub event repository
export interface GitHubEventRepositoryScheme {
	id: number;
	name: string;
	url: string;
}

export class GitHubEventRepository {
	#id: number;
	#name: string;
	#url: string;

	constructor(id: number, name: string, url: string) {
		this.#id = id;
		this.#name = name;
		this.#url = url;
	}

	static import(source: any, name: string = "[source]"): GitHubEventRepository {
		const object = Object.import(source, name);
		const id = Number.import(Reflect.get(object, "name"), `${name}.name`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const result = new GitHubEventRepository(id, $name, url);
		return result;
	}

	static export(source: GitHubEventRepository): GitHubEventRepositoryScheme {
		const id = source.id;
		const name = source.name;
		const url = source.url;
		return { id, name, url };
	}

	get id(): number {
		return this.#id;
	}

	get name(): string {
		return this.#name;
	}

	get url(): string {
		return this.#url;
	}
}
//#endregion

//#region GitHub event payload
export interface GitHubEventPayloadDiscriminator extends GitHubPushEventPayloadDiscriminator, GitHubWatchEventPayloadDiscriminator, GitHubCreateEventPayloadDiscriminator {
	"ForkEvent": any;
	"DeleteEvent": any;
	"IssuesEvent": any;
	"PullRequestEvent": any;
}

export interface GitHubEventPayloadScheme {
	$type: keyof GitHubEventPayloadDiscriminator;
}

export class GitHubEventPayload {
	static import(source: any, name: string = "[source]"): GitHubEventPayload {
		const object = Object.import(source, name);
		const $type = String.import(Reflect.get(object, "$type"), `${name}.$type`);
		switch ($type) {
		case "PushEvent": return GitHubPushEventPayload.import(source, name);
		case "WatchEvent": return GitHubWatchEventPayload.import(source, name);
		case "CreateEvent": return GitHubCreateEventPayload.import(source, name);
		default: throw new TypeError(`Invalid '${$type}' type for ${name}`);
		}
	}

	static export(source: GitHubEventPayload): GitHubEventPayloadScheme {
		if (source instanceof GitHubPushEventPayload) return GitHubPushEventPayload.export(source);
		if (source instanceof GitHubWatchEventPayload) return GitHubWatchEventPayload.export(source);
		if (source instanceof GitHubCreateEventPayload) return GitHubCreateEventPayload.export(source);
		throw new TypeError(`Invalid '${typename(source)}' type for source`);
	}
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

export class GitHubPushEventPayload {
	#push_id: number;
	#ref: string;
	#head: string;
	#before: string;

	constructor(push_id: number, ref: string, head: string, before: string) {
		this.#push_id = push_id;
		this.#ref = ref;
		this.#head = head;
		this.#before = before;
	}

	static import(source: any, name: string = "[source]"): GitHubPushEventPayload {
		const object = Object.import(source, name);
		const push_id = Number.import(Reflect.get(object, "push_id"), `${name}.push_id`);
		const ref = String.import(Reflect.get(object, "ref"), `${name}.ref`);
		const head = String.import(Reflect.get(object, "head"), `${name}.head`);
		const before = String.import(Reflect.get(object, "before"), `${name}.before`);
		const result = new GitHubPushEventPayload(push_id, ref, head, before);
		return result;
	}

	static export(source: GitHubPushEventPayload): GitHubPushEventPayloadScheme {
		const $type = "PushEvent";
		const push_id = source.push_id;
		const ref = source.ref;
		const head = source.head;
		const before = source.before;
		return { $type, push_id, ref, head, before };
	}

	get push_id(): number {
		return this.#push_id;
	}

	get ref(): string {
		return this.#ref;
	}

	get head(): string {
		return this.#head;
	}

	get before(): string {
		return this.#before;
	}
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

export class GitHubWatchEventPayload {
	#action: string;

	constructor(action: string) {
		this.#action = action;
	}

	static import(source: any, name: string = "[source]"): GitHubWatchEventPayload {
		const object = Object.import(source, name);
		const action = String.import(Reflect.get(object, "action"), `${name}.action`);
		const result = new GitHubWatchEventPayload(action);
		return result;
	}

	static export(source: GitHubWatchEventPayload): GitHubWatchEventPayloadScheme {
		const $type = "WatchEvent";
		const action = source.action;
		return { $type, action };
	}

	get action(): string {
		return this.#action;
	}
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

export class GitHubCreateEventPayload {
	#ref: string | null;
	#ref_type: string;
	#master_branch: string;
	#description: string | null;
	#pusher_type: string;

	constructor(ref: string | null, ref_type: string, master_branch: string, description: string | null, pusher_type: string) {
		this.#ref = ref;
		this.#ref_type = ref_type;
		this.#master_branch = master_branch;
		this.#description = description;
		this.#pusher_type = pusher_type;
	}

	static import(source: any, name: string = "[source]"): GitHubCreateEventPayload {
		const object = Object.import(source, name);
		const ref = Reflect.mapNull<unknown, null, string | null>(Reflect.get(object, "ref"), ref => String.import(ref, `${name}.ref`));
		const ref_type = String.import(Reflect.get(object, "ref_type"), `${name}.ref_type`);
		const master_branch = String.import(Reflect.get(object, "master_branch"), `${name}.master_branch`);
		const description = Reflect.mapNull<unknown, null, string | null>(Reflect.get(object, "description"), ref => String.import(ref, `${name}.description`));
		const pusher_type = String.import(Reflect.get(object, "pusher_type"), `${name}.pusher_type`);
		const result = new GitHubCreateEventPayload(ref, ref_type, master_branch, description, pusher_type);
		return result;
	}

	static export(source: GitHubCreateEventPayload): GitHubCreateEventPayloadScheme {
		const $type = "CreateEvent";
		const ref = source.ref;
		const ref_type = source.ref_type;
		const master_branch = source.master_branch;
		const description = source.description;
		const pusher_type = source.pusher_type;
		return { $type, ref, ref_type, master_branch, description, pusher_type };
	}

	get ref(): string | null {
		return this.#ref;
	}

	get ref_type(): string {
		return this.#ref_type;
	}

	get master_branch(): string {
		return this.#master_branch;
	}

	get description(): string | null {
		return this.#description;
	}

	get pusher_type(): string {
		return this.#pusher_type;
	}
}
//#endregion
