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

	async *#fetchPage(page: number, count: number): AsyncIterable<GitHubEvent> {
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
		const name = "github_events";
		let index = 0;
		for (const item of Array.import(await response.json(), name)) {
			try {
				yield GitHubEvent.import(item, `${name}[${index++}]`);
			} catch (reason) {
				console.error(reason);
			}
		}
	}

	async *#readEvents(since: Date): AsyncIterable<GitHubEvent> {
		let page = 1;
		const count = 100;
		while (true) {
			let items = 0;
			for await (const event of this.#fetchPage(page, count)) {
				const date = new Date(event.createdAt);
				if (date < since) return;
				items++;
				yield event;
			}
			if (items < count) return;
			page++;
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		for await (const event of this.#readEvents(since)) {
			if (!event.public) continue;
			const { payload } = event;
			const platform = this.name;
			const timestamp = new Date(event.createdAt);
			const username = event.actor.login;
			const parts = event.repo.name.split("/", 2);
			if (parts.length < 2) throw new SyntaxError(`Incorrect syntax of '${event.repo.name}' repository`);
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
