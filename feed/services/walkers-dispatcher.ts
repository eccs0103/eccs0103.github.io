"use strict";

import "adaptive-extender/node";
import AsyncFileSystem from "fs/promises";
import { dirname } from "path";
import { UserActivity } from "../models/user-activity.js";
import { type EventWalker } from "../services/event-walker.js";

//#region Walkers dispatcher
class WalkersDispatcher {
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

	static async #ensureDirectory(path: string): Promise<void> {
		await AsyncFileSystem.mkdir(dirname(path), { recursive: true });
	}

	static async #readActivities(path: string, activities: UserActivity[]): Promise<void> {
		const content = await AsyncFileSystem.readFile(path, "utf-8");
		const object = JSON.parse(content);
		const name = "activities";
		activities.push(...Array.import(object, name).map((item, index) => {
			return UserActivity.import(item, `${name}[${index}]`);
		}));
	}

	static async #writeActivities(activities: UserActivity[], path: string): Promise<void> {
		const object = activities.map(activity => UserActivity.export(activity));
		await AsyncFileSystem.writeFile(path, JSON.stringify(object, null, "\t"));
	}

	static async *#fetchActivities(walker: EventWalker): AsyncIterable<UserActivity> {
		const events = await walker.readEvents();
		for (const event of events) {
			const activity = await walker.castToActivity(event);
			if (activity === null) continue;
			yield activity;
		}
	}

	static async #runWalker(walker: EventWalker, activities: UserActivity[]): Promise<void> {
		for await (const activity of WalkersDispatcher.#fetchActivities(walker)) {
			if (activities.some(({ platform, timestamp }) => platform === activity.platform && timestamp === activity.timestamp)) continue;
			activities.push(activity);
		}
	}

	static async #runWalkers(walkers: Iterable<EventWalker>, activities: UserActivity[]): Promise<void> {
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
	}

	async execute(): Promise<void> {
		const path = this.#path;
		const activities: UserActivity[] = [];
		await WalkersDispatcher.#ensureDirectory(path);
		await WalkersDispatcher.#readActivities(path, activities);
		await WalkersDispatcher.#runWalkers(this.#walkers, activities);
		await WalkersDispatcher.#writeActivities(activities, path);
	}
}
//#endregion

export { WalkersDispatcher };
