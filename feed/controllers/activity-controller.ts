"use strict";

import "adaptive-extender/node";
import { env } from "../../environment/services/local-environment.js";
import { Controller } from "adaptive-extender/node";
import { ActivityDispatcher } from "./activity-dispatcher.js";
import { ServerBridge } from "../services/server-bridge.js";
import { DataTable } from "../services/data-table.js";
import { Activity } from "../models/activity.js";
import { GitHubWalker } from "../services/github-walker.js";
import { SpotifyWalker } from "../services/spotify-walker.js";
import { PinterestWalker } from "../services/pinterest-walker.js";
import { SteamWalker } from "../services/steam-walker.js";
import { StackOverflowWalker } from "../services/stack-overflow-walker.js";
import { TelegramWalker } from "../services/telegram-walker.js";
import { Configuration } from "../models/configuration.js";
import { type Bridge } from "../services/bridge.js";
import { type ActivityWalker } from "../services/activity-walker.js";

const meta = import.meta;

const { specialDictionary } = env;

const { origin } = env;
const { githubUsername, githubToken } = env;
const { spotifyClientId, spotifyClientSecret, spotifyToken } = env;
const { pinterestClientId, pinterestClientSecret, pinterestToken } = env;
const { steamId, steamApiKey } = env;
const { stackOverflowId, stackOverflowApiKey } = env;
const { telegramChannelId, telegramApiId, telegramApiHash, telegramSession } = env;

//#region Activity controller
class ActivityController extends Controller {
	#bridge: Bridge = new ServerBridge();

	async #readConfiguration(url: Readonly<URL>): Promise<Configuration> {
		const bridge = this.#bridge;
		const content = await bridge.read(url);
		if (content === null) throw new ReferenceError();
		const object = JSON.parse(content);
		return Configuration.import(object, "configuration");
	}

	#updateIntro(configuration: Configuration): void {
		const date = new Date();
		const key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		const content = specialDictionary.get(`1~${key}`);
		if (content === undefined) {
			configuration.intro = "Content is generated automatically. In case of complaints, please contact the developer.";
			return;
		}
		configuration.intro = content;
	}

	#updateOutro(configuration: Configuration): void {
		configuration.outro = "History is silent about what happened next.";
	}

	#updateConfiguration(configuration: Configuration): void {
		this.#updateIntro(configuration);
		this.#updateOutro(configuration);
	}

	async #writeConfiguration(url: Readonly<URL>, configuration: Configuration): Promise<void> {
		const bridge = this.#bridge;
		const object = Configuration.export(configuration);
		const content = JSON.stringify(object, null, "\t");
		await bridge.write(url, content);
	}

	async #updateActivities(configuration: Configuration): Promise<void> {
		const activities = new DataTable(this.#bridge, new URL("../../resources/data/activities", meta.url), Activity);
		const walkers: ActivityWalker[] = [
			new GitHubWalker(githubUsername, githubToken),
			new SpotifyWalker(spotifyClientId, spotifyClientSecret, spotifyToken),
			new PinterestWalker(pinterestClientId, pinterestClientSecret, pinterestToken),
			new SteamWalker(steamId, steamApiKey),
			new StackOverflowWalker(stackOverflowId, stackOverflowApiKey),
			new TelegramWalker(telegramChannelId, telegramApiId, telegramApiHash, telegramSession),
		];
		console.log("Starting feed update...");
		await ActivityDispatcher.launch(activities, origin, walkers, configuration.platforms);
		console.log("Feed update completed");
	}

	async run(): Promise<void> {
		const urlConfiguration = new URL("../../resources/data/feed-configuration.json", meta.url);
		const configuration = await this.#readConfiguration(urlConfiguration);
		this.#updateConfiguration(configuration);
		await this.#writeConfiguration(urlConfiguration, configuration);

		await this.#updateActivities(configuration);
	}

	async catch(error: Error): Promise<void> {
		console.error(`Feed update failed cause of:\n${error}`);
	}
}
//#endregion

await ActivityController.launch();
