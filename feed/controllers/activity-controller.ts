"use strict";

import "adaptive-extender/node";
import { Controller } from "adaptive-extender/node";
import { ActivityDispatcher } from "../services/walkers-dispatcher.js";
import { env } from "../services/local-environment.js";
import { GitHubWalker } from "../services/github-walker.js";
import { SpotifyWalker } from "../services/spotify-walker.js";

//#region Activity controller
class ActivityController extends Controller {
	async run(): Promise<void> {
		const dispatcher = new ActivityDispatcher("feed/data/activity.json");
		const { githubUsername: usernameGitHub, githubToken: tokenGitHub } = env;
		const { spotifyClientId, spotifyClientSecret, spotifyToken } = env;

		dispatcher.connect(new GitHubWalker(usernameGitHub, tokenGitHub));
		dispatcher.connect(new SpotifyWalker(spotifyClientId, spotifyClientSecret, spotifyToken));

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
