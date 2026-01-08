"use strict";

import "adaptive-extender/node";
import { env } from "../../environment/services/local-environment.js";
import { Controller } from "adaptive-extender/node";
import { ActivityDispatcher } from "../services/walkers-dispatcher.js";
import { ServerDataTable } from "../services/server-data-table.js";
import { Activity } from "../models/activity.js";
import { Platform } from "../models/platform.js";
import { GitHubWalker } from "../services/github-walker.js";
import { SpotifyWalker } from "../services/spotify-walker.js";
import { PinterestWalker } from "../services/pinterest-walker.js";
import { SteamWalker } from "../services/steam-walker.js";
import { StackOverflowWalker } from "../services/stack-overflow-walker.js";

const meta = import.meta;
const { origin } = env;
const { githubUsername, githubToken } = env;
const { spotifyClientId, spotifyClientSecret, spotifyToken } = env;
const { pinterestClientId, pinterestClientSecret, pinterestToken } = env;
const { steamId, steamApiKey } = env;
const { stackOverflowId, stackOverflowApiKey } = env;

//#region Activity controller
class ActivityController extends Controller {
	async run(): Promise<void> {
		const activities = new ServerDataTable(new URL("../../resources/data/activities", meta.url), Activity);
		const platforms = new ServerDataTable(new URL("../../resources/data/platforms", meta.url), Platform);

		let page = 0;
		while (await platforms.load(page++));

		const dispatcher = new ActivityDispatcher(activities, origin);
		dispatcher.connect(new GitHubWalker(githubUsername, githubToken));
		dispatcher.connect(new SpotifyWalker(spotifyClientId, spotifyClientSecret, spotifyToken));
		dispatcher.connect(new PinterestWalker(pinterestClientId, pinterestClientSecret, pinterestToken));
		dispatcher.connect(new SteamWalker(steamId, steamApiKey));
		dispatcher.connect(new StackOverflowWalker(stackOverflowId, stackOverflowApiKey));

		console.log("Starting feed update...");
		await dispatcher.execute(platforms);
		console.log("Feed update completed");
	}

	async catch(error: Error): Promise<void> {
		console.error(`Feed update failed cause of:\n${error}`);
	}
}
//#endregion

await ActivityController.launch();
