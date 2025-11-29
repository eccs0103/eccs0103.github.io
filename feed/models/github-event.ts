"use strict";

import "adaptive-extender/core";

//#region GitHub event repository
interface GitHubEventRepositoryScheme {
	name: string;
	url: string;
}

export class GitHubEventRepository {
	#name: string;
	#url: string;

	constructor(name: string, url: string) {
		this.#name = name;
		this.#url = url;
	}

	static import(source: any, name: string = "[source]"): GitHubEventRepository {
		const object = Object.import(source, name);
		const name2 = String.import(Reflect.get(object, "name"), `${name}.name`);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const result = new GitHubEventRepository(name2, url);
		return result;
	}

	static export(source: GitHubEventRepository): GitHubEventRepositoryScheme {
		const name = source.#name;
		const url = source.#url;
		return { name, url };
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
interface GitHubEventPayloadScheme {
}

export class GitHubEventPayload {
	static import(type: string, source: any, name: string = "[source]"): GitHubEventPayload {
		if (type === "PushEvent") return GitHubPushEventPayload.import(source, name);
		if (type === "WatchEvent") return GitHubWatchEventPayload.import(source, name);
		if (type === "CreateEvent") return GitHubCreateEventPayload.import(source, name);
		throw new Error(`Invalid '${type}' type for ${name}`);
	}

	static export(source: GitHubEventPayload): GitHubEventPayloadScheme {
		if (source instanceof GitHubPushEventPayload) return GitHubPushEventPayload.export(source);
		if (source instanceof GitHubWatchEventPayload) return GitHubWatchEventPayload.export(source);
		if (source instanceof GitHubCreateEventPayload) return GitHubCreateEventPayload.export(source);
		throw new Error(`Invalid '${typename(source)}' typen for source`);
	}
}
//#endregion
//#region GitHub push event payload
interface GitHubPushEventPayloadScheme {
	ref: string;
}

export class GitHubPushEventPayload {
	#ref: string;

	constructor(ref: string) {
		this.#ref = ref;
	}

	static import(source: any, name: string = "[source]"): GitHubPushEventPayload {
		const object = Object.import(source, name);
		const ref = String.import(Reflect.get(object, "ref"), `${name}.ref`);
		const result = new GitHubPushEventPayload(ref);
		return result;
	}

	static export(source: GitHubPushEventPayload): GitHubPushEventPayloadScheme {
		const ref = source.#ref;
		return { ref };
	}

	get ref(): string {
		return this.#ref;
	}
}
//#endregion
//#region GitHub watch event payload
interface GitHubWatchEventPayloadScheme {
}

export class GitHubWatchEventPayload {
	static import(source: any, name: string = "[source]"): GitHubWatchEventPayload {
		const object = Object.import(source, name);
		const result = new GitHubWatchEventPayload();
		return result;
	}

	static export(source: GitHubWatchEventPayload): GitHubWatchEventPayloadScheme {
		return {};
	}
}
//#endregion
//#region GitHub create event payload
interface GitHubCreateEventPayloadScheme {
	ref: string | null;
	ref_type: string; // "repository" | "branch" | "tag";
}

export class GitHubCreateEventPayload {
	#ref: string | null;
	#ref_type: string;

	constructor(ref: string | null, ref_type: string) {
		this.#ref = ref;
		this.#ref_type = ref_type;
	}

	static import(source: any, name: string = "[source]"): GitHubCreateEventPayload {
		const object = Object.import(source, name);
		const ref = Reflect.mapNull<unknown, null, string | null>(Reflect.get(object, "ref"), ref => String.import(ref, `${name}.ref`));
		const ref_type = String.import(Reflect.get(object, "ref_type"), `${name}.ref_type`);
		const result = new GitHubCreateEventPayload(ref, ref_type);
		return result;
	}

	static export(source: GitHubCreateEventPayload): GitHubCreateEventPayloadScheme {
		const ref = source.#ref;
		const ref_type = source.#ref_type;
		return { ref, ref_type };
	}

	get ref(): string | null {
		return this.#ref;
	}

	get ref_type(): string {
		return this.#ref_type;
	}
}
//#endregion

//#region GitHub event actor
interface GitHubEventActorScheme {
	id: number;
	login: string;
	display_login?: string;
	gravatar_id: string;
	url: string;
	avatar_url: string;
}
//#endregion

//#region GitHub event
interface GitHubEventScheme {
	type: string; // "PushEvent" | "WatchEvent" | "CreateEvent"
	created_at: string;
	repo: GitHubEventRepositoryScheme;
	payload: GitHubEventPayloadScheme;
	public: boolean;
	// actor: GitHubEventActorScheme;
}

export class GitHubEvent {
	#type: string;
	#created_at: string;
	#repo: GitHubEventRepository;
	#payload: GitHubEventPayload;
	#public: boolean;

	constructor(type: string, created_at: string, repo: GitHubEventRepository, payload: GitHubEventPayload, _public: boolean) {
		this.#type = type;
		this.#created_at = created_at;
		this.#repo = repo;
		this.#payload = payload;
		this.#public = _public;
	}

	static import(source: any, name: string = "[source]"): GitHubEvent {
		const object = Object.import(source, name);
		const type = String.import(Reflect.get(object, "type"), `${name}.type`);
		const created_at = String.import(Reflect.get(object, "created_at"), `${name}.created_at`);
		const repo = GitHubEventRepository.import(Reflect.get(object, "repo"), `${name}.repo`);
		const payload = GitHubEventPayload.import(type, Reflect.get(object, "payload"), `${name}.payload`);
		const _public = Boolean.import(Reflect.get(object, "public"), `${name}.public`);
		const result = new GitHubEvent(type, created_at, repo, payload, _public);
		return result;
	}

	static export(source: GitHubEvent): GitHubEventScheme {
		const type = source.#type;
		const created_at = source.#created_at;
		const repo = GitHubEventRepository.export(source.#repo);
		const payload = GitHubEventPayload.export(source.#payload);
		const _public = source.#public;
		return { type, created_at, repo, payload, public: _public };
	}

	get type(): string {
		return this.#type;
	}

	get created_at(): string {
		return this.#created_at;
	}

	get repo(): GitHubEventRepository {
		return this.#repo;
	}

	get payload(): GitHubEventPayload {
		return this.#payload;
	}

	get public(): boolean {
		return this.#public;
	}
}
//#endregion
