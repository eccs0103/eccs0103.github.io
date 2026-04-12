"use strict";

import "adaptive-extender/core";
import { Controller } from "adaptive-extender/core";
import { type ActivityWalker } from "../services/activity-walker.js";
import { Activity } from "../models/activity.js";
import { type DataTable } from "../services/data-table.js";
import { type Platform } from "../models/configuration.js";

//#region Activity dispatcher
export class ActivityDispatcher extends Controller<[DataTable<typeof Activity>, Date, readonly ActivityWalker[], readonly Platform[]]> {
	static async #runWalker(walker: ActivityWalker, since: Date, activities: Activity[]): Promise<void> {
		const buffer: Activity[] = [];

		for await (const target of walker.crawl(since)) {
			buffer.push(target);
		}

		since = walker.floor(since, buffer);
		let index = activities.length;
		while (index--) {
			const activity = activities[index];
			if (activity.platform !== walker.name) continue;
			if (activity.timestamp < since) continue;
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

	static async #runWalkers(walkers: readonly ActivityWalker[], platforms: readonly Platform[], since: Date, activities: Activity[]): Promise<void> {
		for (const walker of walkers) {
			try {
				const platform = platforms.find(({ name }) => name === walker.name);
				if (platform === undefined || platform.status !== "connected") continue;
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

	async run(activities: DataTable<typeof Activity>, since: Date, walkers: readonly ActivityWalker[], platforms: readonly Platform[]): Promise<void> {
		await activities.load();
		await ActivityDispatcher.#runWalkers(walkers, platforms, since, activities);
		await activities.save();
	}

	async catch(error: Error): Promise<void> {
		console.error(`Feed update failed cause of:\n${error}`);
	}
}
//#endregion
