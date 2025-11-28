"use strict";

import "adaptive-extender/web";
import { writeFile } from "fs/promises";
import { EventWalker } from "./event-walker.js";
import { type GitHubEvent } from "../models/gitHub-event.js";
import { UserActivity } from "../models/user-activity.js";
import { Controller } from "adaptive-extender/web";
import { env } from "./local-environment.js";

//#region GitHub walker
class GitHubWalker extends EventWalker<GitHubEvent> {
	#username: string;
	#token: string;

	constructor(username: string, token: string) {
		super();
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

class GdasdadsaController extends Controller {
	async *#readActivities(walker: GitHubWalker): AsyncIterable<UserActivity> {
		const events = await walker.readEvents();
		for (const event of events) {
			const activity = await walker.castToActivity(event);
			if (activity === null) continue;
			yield activity;
		}
	}

	async run(): Promise<void> {
		const walker = new GitHubWalker(env.usernameGitHub, env.tokenGitHub);
		console.log("Launching GitHub walker");

		const activities: UserActivity[] = [];
		for await (const activity of this.#readActivities(walker)) {
			activities.push(activity);
		}

		// Save to file (in a real scenario, you might merge this with existing data)
		await writeFile("./data/activity-feed.json", JSON.stringify(activities, null, "\t"));
		console.log(`Successfully saved ${activities.length} activities.`);
	}

	async catch(error: Error): Promise<void> {
		console.error("Error during collection:", error);
	}
}

await GdasdadsaController.launch();
