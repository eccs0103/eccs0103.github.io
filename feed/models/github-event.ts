"use strict";

import "adaptive-extender/node";

//#region GitHub event repository
interface GitHubEventRepositoryScheme {
	name: string;
	url: string;
}

class GitHubEventRepository {
	#name: string;
	#url: string;

	constructor(name: string, url: string) {
		this.#name = name;
		this.#url = url;
	}

	get name(): string {
		return this.#name;
	}

	get url(): string {
		return this.#url;
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
}
//#endregion
//#region GitHub event payload commit
interface GitHubEventPayloadCommitScheme {
	message: string;
}

class GitHubEventPayloadCommit {
	#message: string;

	constructor(message: string) {
		this.#message = message;
	}

	get message(): string {
		return this.#message;
	}

	static import(source: any, name: string = "[source]"): GitHubEventPayloadCommit {
		const object = Object.import(source, name);
		const message = String.import(Reflect.get(object, "message"), `${name}.message`);
		const result = new GitHubEventPayloadCommit(message);
		return result;
	}

	static export(source: GitHubEventPayloadCommit): GitHubEventPayloadCommitScheme {
		const message = source.#message;
		return { message };
	}
}
//#endregion
//#region GitHub event payload
interface GitHubEventPayloadScheme {
	commits?: GitHubEventPayloadCommitScheme[];
	size?: number;
	action?: string;
}

class GitHubEventPayload {
	#commits: GitHubEventPayloadCommit[] | undefined;
	#size: number | undefined;
	#action: string | undefined;

	constructor(commits: GitHubEventPayloadCommit[] | undefined, size: number | undefined, action: string | undefined) {
		this.#commits = commits;
		this.#size = size;
		this.#action = action;
	}

	get commits(): GitHubEventPayloadCommit[] | undefined {
		return this.#commits;
	}

	get size(): number | undefined {
		return this.#size;
	}

	get action(): string | undefined {
		return this.#action;
	}

	static import(source: any, name: string = "[source]"): GitHubEventPayload {
		const object = Object.import(source, name);
		const commits = Reflect.mapUndefined<unknown, undefined, GitHubEventPayloadCommit[]>(Reflect.get(object, "commits"), array => Array.import(array, `${name}.commits`).map((item, index) => {
			return GitHubEventPayloadCommit.import(item, `${name}.commits[${index}]`);
		}));
		const size = Reflect.mapUndefined<unknown, undefined, number>(Reflect.get(object, "size"), primitive => Number.import(primitive, `${name}.size`));
		const action = Reflect.mapUndefined<unknown, undefined, string>(Reflect.get(object, "action"), primitive => String.import(primitive, `${name}.action`));
		const result = new GitHubEventPayload(commits, size, action);
		return result;
	}

	static export(source: GitHubEventPayload): GitHubEventPayloadScheme {
		const commits = Reflect.mapUndefined(source.#commits, commits => commits.map(commit => {
			return GitHubEventPayloadCommit.export(commit);
		}));
		const size = source.#size;
		const action = source.#action;
		return { commits, size, action };
	}
}
//#endregion
//#region GitHub event
interface GitHubEventScheme {
	type: string;
	created_at: string;
	repo: GitHubEventRepositoryScheme;
	payload: GitHubEventPayloadScheme;
}

class GitHubEvent {
	#type: string;
	#createdAt: string;
	#repository: GitHubEventRepository;
	#payload: GitHubEventPayload;

	constructor(type: string, createdAt: string, repository: GitHubEventRepository, payload: GitHubEventPayload) {
		this.#type = type;
		this.#createdAt = createdAt;
		this.#repository = repository;
		this.#payload = payload;
	}

	get type(): string {
		return this.#type;
	}

	get createdAt(): string {
		return this.#createdAt;
	}

	get repository(): GitHubEventRepository {
		return this.#repository;
	}

	get payload(): GitHubEventPayload {
		return this.#payload;
	}

	static import(source: any, name: string = "[source]"): GitHubEvent {
		const object = Object.import(source, name);
		const type = String.import(Reflect.get(object, "type"), `${name}.type`);
		const createdAt = String.import(Reflect.get(object, "created_at"), `${name}.created_at`);
		const repository = GitHubEventRepository.import(Reflect.get(object, "repo"), `${name}.repo`);
		const payload = GitHubEventPayload.import(Reflect.get(object, "payload"), `${name}.payload`);
		const result = new GitHubEvent(type, createdAt, repository, payload);
		return result;
	}

	static export(source: GitHubEvent): GitHubEventScheme {
		const type = source.#type;
		const created_at = source.#createdAt;
		const repo = GitHubEventRepository.export(source.#repository);
		const payload = GitHubEventPayload.export(source.#payload);
		return { type, created_at, repo, payload };
	}
}
//#endregion

export { GitHubEvent };
