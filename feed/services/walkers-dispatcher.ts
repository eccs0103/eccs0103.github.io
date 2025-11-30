"use strict";

import "adaptive-extender/core";
import AsyncFileSystem from "fs/promises";
import { dirname } from "path";
import { GitHubActivity } from "../models/user-activity.js";
import { type EventWalker } from "../services/event-walker.js";

//#region Walkers dispatcher
export class WalkersDispatcher {
	#path: string;
	#walkers: Set<EventWalker> = new Set();

	constructor(path: string) {
		this.#path = path;
	}

	connect(walker: EventWalker): void {
		this.#walkers.add(walker);
	}

	disconnect(walker: EventWalker): void {
		this.#walkers.delete(walker);
	}

	static async #ensureStorage(path: string): Promise<void> {
		await AsyncFileSystem.mkdir(dirname(path), { recursive: true });
		try {
			await AsyncFileSystem.access(path, AsyncFileSystem.constants.F_OK);
		} catch {
			await WalkersDispatcher.#writeActivities([], path);
		}
	}

	static async #readActivities(path: string, activities: GitHubActivity[]): Promise<void> {
		const content = await AsyncFileSystem.readFile(path, "utf-8");
		const object = JSON.parse(content);
		const name = "activities";
		activities.push(...Array.import(object, name).map((item, index) => {
			return GitHubActivity.import(item, `${name}[${index}]`);
		}));
	}

	static async #runWalker(walker: EventWalker, activities: GitHubActivity[]): Promise<void> {
		for await (const target of walker.crawl()) {
			if (activities.some(activity => GitHubActivity.isSame(activity, target))) continue;
			activities.push(target);
		}
	}

	static async #runWalkers(walkers: Iterable<EventWalker>, activities: GitHubActivity[]): Promise<void> {
		for (const walker of walkers) {
			try {
				const before = activities.length;
				await WalkersDispatcher.#runWalker(walker, activities);
				const count = activities.length - before;
				if (count === 0) continue;
				console.log(`Added ${count} new activities from ${walker.name}`);
			} catch (reason) {
				console.error(`Unable to fetch activities from ${walker.name} cause: ${Error.from(reason)}`);
			}
		}
		activities.sort(GitHubActivity.earlier);
	}

	static async #writeActivities(activities: GitHubActivity[], path: string): Promise<void> {
		const object = activities.map(activity => GitHubActivity.export(activity));
		await AsyncFileSystem.writeFile(path, JSON.stringify(object, null, "\t"));
	}

	async execute(): Promise<void> {
		const path = this.#path;
		const activities: GitHubActivity[] = [];
		await WalkersDispatcher.#ensureStorage(path);
		await WalkersDispatcher.#readActivities(path, activities);
		await WalkersDispatcher.#runWalkers(this.#walkers, activities);
		await WalkersDispatcher.#writeActivities(activities, path);
	}
}
//#endregion
