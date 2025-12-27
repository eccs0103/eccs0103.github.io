"use strict";

import "adaptive-extender/node";
import { Controller } from "adaptive-extender/node";
import { ActivityDispatcher } from "../services/walkers-dispatcher.js";
import { env } from "../../environment/services/local-environment.js";
import { GitHubWalker } from "../services/github-walker.js";
import { SpotifyWalker } from "../services/spotify-walker.js";
import { ServerDataTable } from "../services/server-data-table.js";
import { Activity } from "../models/activity.js";
import { Platform } from "../models/platform.js";
import { PinterestWalker } from "../services/pinterest-walker.js";
import { SteamWalker } from "../services/steam-walker.js";

const meta = import.meta;
const { origin } = env;
const { githubUsername, githubToken } = env;
const { spotifyClientId, spotifyClientSecret, spotifyToken } = env;
const { pinterestClientId, pinterestClientSecret, pinterestToken } = env;
const { steamId, steamApiKey } = env;

//#region Activity controller
class ActivityController extends Controller {
	async run(): Promise<void> {
		const activities = new ServerDataTable(new URL("../../resources/data/activities.json", meta.url), Activity);
		const platforms = new ServerDataTable(new URL("../../resources/data/platforms.json", meta.url), Platform);
		await platforms.load();

		const dispatcher = new ActivityDispatcher(activities, origin);
		dispatcher.connect(new GitHubWalker(githubUsername, githubToken));
		dispatcher.connect(new SpotifyWalker(spotifyClientId, spotifyClientSecret, spotifyToken));
		dispatcher.connect(new PinterestWalker(pinterestClientId, pinterestClientSecret, pinterestToken));
		dispatcher.connect(new SteamWalker(steamId, steamApiKey));

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
