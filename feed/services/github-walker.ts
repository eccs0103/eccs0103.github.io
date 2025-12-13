"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { GitHubCreateEventPayload, GitHubEvent, GitHubPushEventPayload, GitHubWatchEventPayload } from "../models/github-event.js";
import { Activity, GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubPushActivity, GitHubWatchActivity } from "../models/activity.js";

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
		const data: any = await response.json();
		const name = "github_events";
		let index = 0;
		for (const item of Array.import(data, name)) {
			try {
				yield GitHubEvent.import(item, `${name}[${index++}]`);
			} catch (reason) {
				console.error(reason);
				continue;
			}
		}
	}

	async *#readEvents(): AsyncIterable<GitHubEvent> {
		let page = 1;
		while (page <= 3) {
			for await (const event of this.#fetchPage(page++, 100)) {
				yield event;
			}
		}
	}

	async *crawl(): AsyncIterable<Activity> {
		for await (const event of this.#readEvents()) {
			try {
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
				else if (payload instanceof GitHubWatchEventPayload) {
					yield new GitHubWatchActivity(platform, timestamp, username, url, repository);
				}
				else if (payload instanceof GitHubCreateEventPayload) {
					const name = payload.ref ?? repository;
					switch (payload.refType) {
					case "tag": yield new GitHubCreateTagActivity(platform, timestamp, username, url, repository, name);
					case "branch": yield new GitHubCreateBranchActivity(platform, timestamp, username, url, repository, name);
					case "repository": yield new GitHubCreateRepositoryActivity(platform, timestamp, username, url, repository, name);
					}
				}
			} catch (reason) {
				console.error(reason);
				continue;
			}
		}
	}
}
//#endregion
