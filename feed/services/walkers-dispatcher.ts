"use strict";

import "adaptive-extender/core";
import AsyncFileSystem from "fs/promises";
import { dirname } from "path";
import { type ActivityWalker } from "./activity-walker.js";
import { Activity } from "../models/activity.js";

//#region Activity dispatcher
export class ActivityDispatcher {
	#path: URL;
	#walkers: Set<ActivityWalker> = new Set();

	constructor(path: URL) {
		this.#path = path;
	}

	connect(walker: ActivityWalker): void {
		this.#walkers.add(walker);
	}

	disconnect(walker: ActivityWalker): void {
		this.#walkers.delete(walker);
	}

	static async #ensureStorage(path: URL): Promise<void> {
		await AsyncFileSystem.mkdir(dirname(path.toString()), { recursive: true });
		try {
			await AsyncFileSystem.access(path, AsyncFileSystem.constants.F_OK);
		} catch {
			await ActivityDispatcher.#writeActivities([], path);
		}
	}

	static async #readActivities(path: URL, activities: Activity[]): Promise<void> {
		const object = JSON.parse(await AsyncFileSystem.readFile(path, "utf-8"));
		const name = "activities";
		activities.push(...Array.import(object, name).map((item, index) => {
			return Activity.import(item, `${name}[${index}]`);
		}));
	}

	static async #runWalker(walker: ActivityWalker, activities: Activity[]): Promise<void> {
		for await (const target of walker.crawl()) {
			if (activities.some(activity => Activity.isSame(activity, target))) continue;
			activities.push(target);
		}
	}

	static async #runWalkers(walkers: Iterable<ActivityWalker>, activities: Activity[]): Promise<void> {
		for (const walker of walkers) {
			try {
				console.log(`Launching ${walker.name} for crawl`);
				const before = activities.length;
				await ActivityDispatcher.#runWalker(walker, activities);
				const count = activities.length - before;
				if (count === 0) continue;
				console.log(`Added ${count} new activities from ${walker.name}`);
			} catch (reason) {
				console.error(`Unable to fetch activities from ${walker.name} cause:\n${Error.from(reason)}`);
			}
		}
		activities.sort(Activity.earlier);
	}

	static async #writeActivities(activities: Activity[], path: URL): Promise<void> {
		const object = activities.map(activity => Activity.export(activity));
		await AsyncFileSystem.writeFile(path, JSON.stringify(object, null, "\t"));
	}

	async execute(): Promise<void> {
		const path = this.#path;
		const activities: Activity[] = [];
		await ActivityDispatcher.#ensureStorage(path);
		await ActivityDispatcher.#readActivities(path, activities);
		await ActivityDispatcher.#runWalkers(this.#walkers, activities);
		await ActivityDispatcher.#writeActivities(activities, path);
	}
}
//#endregion
