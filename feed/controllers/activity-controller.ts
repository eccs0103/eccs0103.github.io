"use strict";

import "adaptive-extender/node";
import { Controller } from "adaptive-extender/node";
import { GitHubWalker } from "../services/github-walker.js";
import { env } from "../services/local-environment.js";
import { ActivityDispatcher } from "../services/walkers-dispatcher.js";

//#region Activity controller
class ActivityController extends Controller {
	async run(): Promise<void> {
		const dispatcher = new ActivityDispatcher("feed/data/activity.json");
		const { usernameGitHub, tokenGitHub } = env;

		dispatcher.connect(new GitHubWalker(usernameGitHub, tokenGitHub));

		console.log("Starting feed update...");
		await dispatcher.execute();
		console.log("Feed update completed");
	}

	async catch(error: Error): Promise<void> {
		console.error(`Feed update failed cause of ${error}`);
	}
}
//#endregion

await ActivityController.launch();
