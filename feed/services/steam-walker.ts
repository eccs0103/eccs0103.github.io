"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { SteamGame, SteamAchievement, SteamOwnedGamesContainer, SteamPlayerStatsContainer, SteamGameSchemaContainer, SteamUserFilesResponseContainer, SteamPublishedFile } from "../models/steam-event.js";
import { Activity, SteamAchievementActivity, SteamScreenshotActivity } from "../models/activity.js";

//#region Steam walker
export class SteamWalker extends ActivityWalker {
	#id: string;
	#apiKey: string;

	constructor(id: string, apiKey: string) {
		super("Steam");
		this.#id = id;
		this.#apiKey = apiKey;
	}

	async #fetchApi($interface: string, method: string, version: string, params: Record<string, string>): Promise<any> {
		const url = new URL(`https://api.steampowered.com/${$interface}/${method}/${version}/`);
		url.searchParams.set("key", this.#apiKey);
		url.searchParams.set("format", "json");
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, value);
		}
		const response = await fetch(url);
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		return await response.json();
	}

	async *#fetchOwnedGames(): AsyncIterable<SteamGame> {
		const data = await this.#fetchApi("IPlayerService", "GetOwnedGames", "v0001", {
			["steamid"]: this.#id,
			["include_appinfo"]: "1",
			["include_played_free_games"]: "1"
		});
		const { response } = SteamOwnedGamesContainer.import(data, "steam_owned_games");
		const { games } = response;
		if (games === undefined) {
			console.warn("⚠️ Information about games is missing. Maybe profile is hidden.");
			return;
		}
		yield* games;
	}

	async *#fetchAchievementsMapping(appId: number): AsyncIterable<[string, string]> {
		const data = await this.#fetchApi("ISteamUserStats", "GetSchemaForGame", "v2", {
			["appid"]: String(appId),
			["l"]: "english"
		});
		const { game } = SteamGameSchemaContainer.import(data, "steam_game_schema");
		const { availableGameStats } = game;
		if (availableGameStats === undefined) return;
		const { achievements } = availableGameStats;
		if (achievements === undefined) return;
		for (const achievement of achievements) {
			const { name, icon } = achievement;
			yield [name, icon];
		}
	}

	async *#fetchPlayerAchievements(appId: number): AsyncIterable<SteamAchievement> {
		const data = await this.#fetchApi("ISteamUserStats", "GetPlayerAchievements", "v0001", {
			["steamid"]: this.#id,
			["appid"]: String(appId),
			["l"]: "english"
		});
		const { playerStats } = SteamPlayerStatsContainer.import(data, "steam_player_stats");
		if (!playerStats.success) throw new Error(playerStats.error);
		const { achievements } = playerStats;
		if (achievements === undefined) return;
		yield* achievements;
	}

	async *#fetchPaginatedFiles(page: number, count: number): AsyncIterable<SteamPublishedFile> {
		const data = await this.#fetchApi("IPublishedFileService", "GetUserFiles", "v1", {
			["steamid"]: this.#id,
			["appid"]: "0",
			["page"]: String(page),
			["numperpage"]: String(count),
			["include_app_logo"]: "1",
			["include_extended_app_details"]: "1"
		});
		const { response } = SteamUserFilesResponseContainer.import(data, "steam_user_files");
		const { publishedFileDetails } = response;
		if (publishedFileDetails === undefined) return;
		yield* publishedFileDetails;
	}

	async *#fetchScreenshots(since: Date): AsyncIterable<SteamPublishedFile> {
		const chunk = 100;
		let page = 1;
		while (true) {
			let index = 0;
			for await (const file of this.#fetchPaginatedFiles(page, chunk)) {
				index++;
				if (file.timeCreated < since) continue;
				yield file;
			}
			if (index < chunk) return;
			page++;
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		const games: Map<number, string> = new Map();
		const platform = this.name;
		for await (const game of this.#fetchOwnedGames()) {
			const { appId, name } = game;
			games.set(appId, name);
			if (game.playtimeForever < 120) continue;
			if (game.rtimeLastPlayed < since) continue;
			const { imgIconUrl, hasCommunityVisibleStats } = game;
			if (hasCommunityVisibleStats === undefined || !hasCommunityVisibleStats) continue;
			const mapping = await Array.fromAsync(this.#fetchAchievementsMapping(appId));
			const icons = new Map(mapping);
			for await (const achievement of this.#fetchPlayerAchievements(appId)) {
				if (!achievement.achieved) continue;
				const { unlockTime, apiName } = achievement;
				if (unlockTime < since) continue;
				const webpage = `https://store.steampowered.com/app/${appId}`;
				const icon =
					icons.get(apiName) ??
					Reflect.mapUndefined(imgIconUrl, url => `http://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${url}.jpg`) ??
					null;
				const title = achievement.name ?? apiName;
				const description = achievement.description ?? null;
				const url = `https://steamcommunity.com/stats/${appId}/achievements`;
				yield new SteamAchievementActivity(platform, unlockTime, name, webpage, icon, title, description, url);
			}
		}
		for await (const file of this.#fetchScreenshots(since)) {
			if (file.banned || file.visibility !== 0) continue;
			const url = file.fileUrl ?? file.previewUrl;
			if (url === undefined) continue;
			const timestamp = file.timeCreated;
			const { consumerAppId } = file;
			const game = games.get(consumerAppId);
			if (game === undefined) continue;
			const webpage = `https://store.steampowered.com/app/${consumerAppId}`;
			const title = file.title.insteadWhitespace(null);
			yield new SteamScreenshotActivity(platform, timestamp, game, webpage, url, title);
		}
	}
}
//#endregion
