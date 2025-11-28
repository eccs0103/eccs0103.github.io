"use strict";

import "adaptive-extender/web";
import { writeFile } from "fs/promises";
import { Controller } from "adaptive-extender/web";
import { GitHubWalker } from "../services/github-walker.js";
import { env } from "../services/local-environment.js";
import { UserActivity } from "../models/user-activity.js";

//#region Feed controller
class FeedController extends Controller {
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
		console.log("Launching GitHub walker...");

		const activities: UserActivity[] = [];
		for await (const activity of this.#readActivities(walker)) {
			activities.push(activity);
		}

		const outputPath = "feed/data/activity.json";
		await writeFile(outputPath, JSON.stringify(activities, null, "\t"));
		console.log(`Successfully saved ${activities.length} activities to ${outputPath}.`);
	}

	async catch(error: Error): Promise<void> {
		console.error("Error during collection:", error);
	}
}
//#endregion

await FeedController.launch();
