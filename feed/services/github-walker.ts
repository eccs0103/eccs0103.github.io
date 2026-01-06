"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { GitHubCreateEventPayload, GitHubDeleteEventPayload, GitHubEvent, GitHubPushEventPayload, GitHubReleaseEventPayload, GitHubWatchEventPayload } from "../models/github-event.js";
import { Activity, GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubDeleteBranchActivity, GitHubDeleteTagActivity, GitHubPushActivity, GitHubReleaseActivity, GitHubWatchActivity } from "../models/activity.js";

//#region GitHub walker
export class GitHubWalker extends ActivityWalker {
	#username: string;
	#token: string;

	constructor(username: string, token: string) {
		super("GitHub");
		this.#username = username;
		this.#token = token;
	}

	async *#fetchPaginated(page: number, count: number): AsyncIterable<any> {
		const url = new URL(`https://api.github.com/users/${this.#username}/events`);
		url.searchParams.set("per_page", String(count));
		url.searchParams.set("page", String(page));
		const headers: HeadersInit = {
			["Authorization"]: `Bearer ${this.#token}`,
			["Accept"]: "application/vnd.github+json",
			["User-Agent"]: "Digital garden"
		};
		const response = await fetch(url, { headers });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		yield* Array.import(await response.json(), "github_events");
	}

	async *#fetchEvents(since: Date): AsyncIterable<GitHubEvent> {
		const chunk = 100;
		let page = 1;
		while (true) {
			let index = 0;
			for await (const item of this.#fetchPaginated(page, chunk)) {
				try {
					const event = GitHubEvent.import(item, `github_events[${index++}]`);
					if (event.createdAt < since) return;
					yield event;
				} catch (reason) {
					console.error(reason);
				}
			}
			if (index < chunk) return;
			page++;
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		for await (const event of this.#fetchEvents(since)) {
			if (!event.public) continue;
			const { payload, repo } = event;
			const platform = this.name;
			const timestamp = event.createdAt;
			const username = event.actor.login;
			const parts = repo.name.split("/", 2);
			if (parts.length < 2) throw new SyntaxError(`Incorrect syntax of '${repo.name}' repository`);
			const [, repository] = parts;
			const url = `https://github.com/${username}/${repository}`;
			if (payload instanceof GitHubPushEventPayload) {
				yield new GitHubPushActivity(platform, timestamp, username, url, repository, payload.head);
			}
			if (payload instanceof GitHubReleaseEventPayload) {
				const { name, tagName, prerelease } = payload.release;
				yield new GitHubReleaseActivity(platform, timestamp, username, url, repository, name ?? tagName, prerelease);
			}
			if (payload instanceof GitHubWatchEventPayload) {
				yield new GitHubWatchActivity(platform, timestamp, username, url, repository);
			}
			if (payload instanceof GitHubCreateEventPayload) {
				const { ref, refType } = payload;
				const name = ref ?? repository;
				switch (refType) {
				case "tag": yield new GitHubCreateTagActivity(platform, timestamp, username, url, repository, name); break;
				case "branch": yield new GitHubCreateBranchActivity(platform, timestamp, username, url, repository, name); break;
				case "repository": yield new GitHubCreateRepositoryActivity(platform, timestamp, username, url, repository, name); break;
				default: throw new Error(`Invalid '${refType}' refType for GitHubCreateEventPayload`);
				}
			}
			if (payload instanceof GitHubDeleteEventPayload) {
				const { ref: name, refType } = payload;
				switch (refType) {
				case "tag": yield new GitHubDeleteTagActivity(platform, timestamp, username, url, repository, name); break;
				case "branch": yield new GitHubDeleteBranchActivity(platform, timestamp, username, url, repository, name); break;
				default: throw new Error(`Invalid '${refType}' refType for GitHubDeleteEventPayload`);
				}
			}
		}
	}
}
//#endregion
