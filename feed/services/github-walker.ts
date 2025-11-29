"use strict";

import "adaptive-extender/node";
import { EventWalker } from "./event-walker.js";
import { GitHubEvent } from "../models/github-event.js";
import { UserActivity } from "../models/user-activity.js";

//#region GitHub walker
class GitHubWalker extends EventWalker<GitHubEvent> {
	#username: string;
	#token: string;

	constructor(username: string, token: string) {
		super("GitHub");
		this.#username = username;
		this.#token = token;
	}

	async *#readEvents(page: number, count: number): AsyncIterable<GitHubEvent> {
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
		const name = "event";
		let index = 0;
		for (const item of Array.import(await response.json(), name)) {
			yield GitHubEvent.import(item, `${name}[${index}]`);
			index++;
		}
	}

	async *readEvents(): AsyncIterable<GitHubEvent> {
		let attempt = 0;
		let page = 1;
		while (page <= 3) {
			try {
				yield* this.#readEvents(page, 100);
				page++;
				attempt = 0;
			} catch (reason) {
				attempt++;
				if (attempt < 3) continue;
				throw reason;
			}
		}
	}

	async castToActivity(event: GitHubEvent): Promise<UserActivity | null> {
		const { repository: repo, type, payload } = event;
		const timestamp = new Date(event.createdAt);
		const { name } = repo;
		const { commits, size } = payload;
		const platform = this.name;
		const url = `https://github.com/${name}`;
		switch (type) {
			case "PushEvent": {
				const count = size ?? commits?.length;
				if (count === undefined) return null;
				return new UserActivity(platform, type, `Pushed ${count} commits to ${name}`, url, timestamp);
			}
			case "WatchEvent": return new UserActivity(platform, type, `Starred repository ${name}`, url, timestamp);
			case "CreateEvent": return new UserActivity(platform, type, `Created new repository ${name}`, url, timestamp);
			default: return null;
		}
	}
}
//#endregion

export { GitHubWalker };
