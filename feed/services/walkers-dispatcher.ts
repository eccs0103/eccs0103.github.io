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
	#since: Date;

	constructor(activities: DataTable<typeof Activity>, since: Date) {
		this.#activities = activities;
		this.#since = since;
	}

	connect(walker: ActivityWalker): void {
		this.#walkers.add(walker);
	}

	disconnect(walker: ActivityWalker): void {
		this.#walkers.delete(walker);
	}

	static async #runWalker(walker: ActivityWalker, since: Date, activities: Activity[]): Promise<void> {
		const buffer: Activity[] = [];

		for await (const target of walker.crawl(since)) {
			buffer.push(target);
		}

		if (buffer.length > 0) {
			const oldest = buffer.reduce((min, current) => current.timestamp.valueOf() < min.valueOf() ? current.timestamp : min, new Date(8640_000_000_000_000));
			if (oldest.valueOf() > since.valueOf()) since = oldest;
		}
		let index = activities.length;
		while (index--) {
			const activity = activities[index];
			if (activity.platform !== walker.name) continue;
			if (activity.timestamp.valueOf() < since.valueOf()) continue;
			const indexRemote = buffer.findIndex(remote => Activity.isSame(activity, remote));
			if (indexRemote < 0) {
				activities.splice(index, 1);
				continue;
			}
			activities[index] = buffer[indexRemote];
			buffer.splice(indexRemote, 1);
		}

		activities.push(...buffer);
	}

	static async #runWalkers(walkers: Iterable<ActivityWalker>, platforms: readonly Platform[], since: Date, activities: Activity[]): Promise<void> {
		for (const walker of walkers) {
			try {
				const platform = platforms.find(({ name }) => name === walker.name);
				if (platform === undefined || !platform.isActive) continue;
				console.log(`Launching ${walker.name} for crawl`);
				const before = activities.length;
				await ActivityDispatcher.#runWalker(walker, since, activities);
				const count = activities.length - before;
				if (count === 0) continue;
				console.log(`Synced activities from ${walker.name}. Net change: ${count}`);
			} catch (reason) {
				console.error(`Unable to fetch activities from ${walker.name} cause:\n${Error.from(reason)}`);
			}
		}
		activities.sort(Activity.earlier);
	}

	async execute(platforms: readonly Platform[]): Promise<void> {
		const activities = this.#activities;
		let page = 0;
		while (await activities.load(page++));
		await ActivityDispatcher.#runWalkers(this.#walkers, platforms, this.#since, activities);
		await activities.save();
	}
}
//#endregion
