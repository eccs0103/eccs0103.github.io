"use strict";

import "adaptive-extender/core";
import { EventWalker } from "./event-walker.js";
import { GitHubCreateEventPayload, GitHubEvent, GitHubPushEventPayload, GitHubWatchEventPayload } from "../models/github-event.js";
import { GitHubActivity } from "../models/user-activity.js";

//#region GitHub walker
export class GitHubWalker extends EventWalker {
	#username: string;
	#token: string;

	constructor(username: string, token: string) {
		super("GitHub");
		this.#username = username;
		this.#token = token;
	}

	async #fetchPaginatedEvents(page: number, count: number): Promise<GitHubEvent> {
		const url = new URL(`https://api.github.com/users/${this.#username}/events`);
		url.searchParams.set("per_page", String(count));
		url.searchParams.set("page", String(page));
		const headers: HeadersInit = {
			["Authorization"]: `Bearer ${this.#token}`,
			["Accept"]: "application/vnd.github+json",
			["User-Agent"]: "Arman-Personal-Site-Collector"
		};
		const response = await fetch(url, { headers });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		return await response.json();
	}

	async *#importPaginatedEvents(page: number, count: number): AsyncIterable<GitHubEvent> {
		const source = await this.#fetchPaginatedEvents(page, count);
		const name = "event";
		let index = 0;
		for (const item of Array.import(source, name)) {
			try {
				yield GitHubEvent.import(item, `${name}[${index++}]`);
			} catch (reason) {
				console.error(reason);
				continue;
			}
		}
	}

	async *#importEvents(pages: number): AsyncIterable<GitHubEvent> {
		let attempt = 0;
		let page = 1;
		while (page <= pages) {
			try {
				yield* this.#importPaginatedEvents(page, 100);
				page++;
				attempt = 0;
			} catch (reason) {
				attempt++;
				if (attempt < 3) continue;
				throw reason;
			}
		}
	}

	async *crawl(): AsyncIterable<GitHubActivity> {
		for await (const event of this.#importEvents(3)) {
			const { repo: repo, type, payload, created_at, public: _public } = event;
			if (!_public) continue;
			const timestamp = Date.parse(created_at);
			const { name } = repo;
			const platform = this.name;
			const url = `https://github.com/${name}`;
			if (payload instanceof GitHubPushEventPayload) {
				const branch = payload.ref?.replace("refs/heads/", "") ?? "repository";
				yield new GitHubActivity(platform, type, `Pushed to '${branch}' in ${name}`, url, timestamp);
			}
			if (payload instanceof GitHubWatchEventPayload) {
				yield new GitHubActivity(platform, type, `Starred repository ${name}`, url, timestamp);
			}
			if (payload instanceof GitHubCreateEventPayload) {
				const objectType = payload.ref_type;
				const objectName = (` ${payload.ref ?? String.empty}`).trim();
				yield new GitHubActivity(platform, type, `Created ${objectType} '${objectName}' in ${name}`, url, timestamp);
			}
			continue;
		}
	}
}
//#endregion
