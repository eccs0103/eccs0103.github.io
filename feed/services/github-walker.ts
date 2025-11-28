"use strict";

import "adaptive-extender/node";
import { EventWalker } from "./event-walker.js";
import { type GitHubEvent } from "../models/github-event.js";
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

	async readEvents(): Promise<GitHubEvent[]> {
		const url = new URL(`https://api.github.com/users/${this.#username}/events`);
		const headers: HeadersInit = {
			["Authorization"]: `Bearer ${this.#token}`,
			["Accept"]: "application/vnd.github+json",
			["User-Agent"]: "Arman-Personal-Site-Collector"
		};
		const response = await fetch(url, { headers });
		if (!response.ok) throw new Error(`Failed to fetch GitHub events: ${response.statusText}`);
		const data = await response.json();
		return data as GitHubEvent[];
	}

	async castToActivity(event: GitHubEvent): Promise<UserActivity | null> {
		const { repo, type, payload, created_at } = event;
		const { name } = repo;
		const { commits } = payload;
		const platform = "GitHub";
		const url = `https://github.com/${name}`;
		switch (type) {
			case "PushEvent": return new UserActivity(platform, type, `Pushed ${commits?.length ?? NaN} commits to ${name}`, url, created_at);
			case "WatchEvent": return new UserActivity(platform, type, `Starred repository ${name}`, url, created_at);
			case "CreateEvent": return new UserActivity(platform, type, `Created new repository ${name}`, url, created_at);
			default: return null;
		}
	}
}
//#endregion

export { GitHubWalker };
