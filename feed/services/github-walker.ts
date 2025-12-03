"use strict";

import "adaptive-extender/core";
import { ActivityWalker } from "./activity-walker.js";
import { GitHubCreateEventPayload, GitHubEvent, GitHubPushEventPayload, GitHubWatchEventPayload } from "../models/github-event.js";
import { GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubPushActivity, GitHubWatchActivity, type Activity } from "../models/activity.js";

//#region GitHub walker
export class GitHubWalker extends ActivityWalker {
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
		return GitHubEvent.import(await response.json(), "github_event");
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

	async *crawl(): AsyncIterable<Activity> {
		for await (const event of this.#importEvents(3)) {
			if (!event.public) continue;
			const { payload, repo } = event;
			const platform = this.name;
			const timestamp = new Date(event.createdAt);
			const { login: username } = event.actor;
			const { url } = repo;
			const repository = repo.name.replace(`${username}/`, String.empty);
			if (payload instanceof GitHubPushEventPayload) {
				yield new GitHubPushActivity(platform, timestamp, username, url, repository, payload.head);
			}
			if (payload instanceof GitHubWatchEventPayload) {
				yield new GitHubWatchActivity(platform, timestamp, username, url, repository);
			}
			if (payload instanceof GitHubCreateEventPayload) {
				const name = payload.ref ?? repository;
				switch (payload.refType) {
				case "tag": yield new GitHubCreateTagActivity(platform, timestamp, username, url, repository, name);
				case "branch": yield new GitHubCreateBranchActivity(platform, timestamp, username, url, repository, name);
				case "repository": yield new GitHubCreateRepositoryActivity(platform, timestamp, username, url, repository, name);
				}
			}
		}
	}
}
//#endregion
