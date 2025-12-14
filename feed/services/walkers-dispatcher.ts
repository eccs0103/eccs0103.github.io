"use strict";

import "adaptive-extender/core";
import { type ActivityWalker } from "./activity-walker.js";
import { Activity } from "../models/activity.js";
import { type DataTable } from "./data-table.js";
import { type Platform } from "../models/platform.js";

//#region Activity dispatcher
export class ActivityDispatcher {
	#walkers: Set<ActivityWalker> = new Set();
	#activities: DataTable<typeof Activity>;

	constructor(activities: DataTable<typeof Activity>) {
		this.#activities = activities;
	}

	connect(walker: ActivityWalker): void {
		this.#walkers.add(walker);
	}

	disconnect(walker: ActivityWalker): void {
		this.#walkers.delete(walker);
	}

	static async #runWalker(walker: ActivityWalker, activities: Activity[]): Promise<void> {
		for await (const target of walker.crawl()) {
			if (activities.some(activity => Activity.isSame(activity, target))) continue;
			activities.push(target);
		}
	}

	static async #runWalkers(walkers: Iterable<ActivityWalker>, platforms: readonly Platform[], activities: Activity[]): Promise<void> {
		for (const walker of walkers) {
			try {
				const platform = platforms.find(({ name }) => name === walker.name);
				if (platform === undefined || !platform.isActive) continue;
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

	async execute(platforms: readonly Platform[]): Promise<void> {
		const activities = this.#activities;
		await activities.load();
		await ActivityDispatcher.#runWalkers(this.#walkers, platforms, activities);
		await activities.save();
	}
}
//#endregion
