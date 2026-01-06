"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { SteamGame, SteamAchievement, SteamOwnedGamesContainer, SteamPlayerStatsContainer, SteamGameSchemaContainer } from "../models/steam-event.js";
import { Activity, SteamAchievementActivity } from "../models/activity.js";

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
		try {
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
		} catch (reason) {
			console.error(reason);
			return;
		}
	}

	async *#fetchAchievements(appId: number): AsyncIterable<SteamAchievement> {
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

	async *crawl(since: Date): AsyncIterable<Activity> {
		for await (const game of this.#fetchOwnedGames()) {
			if (game.playtimeForever < 20) continue;
			const { appId, imgIconUrl, hasCommunityVisibleStats } = game;
			if (hasCommunityVisibleStats === undefined || !hasCommunityVisibleStats) continue;
			const webpage = `https://store.steampowered.com/app/${appId}`;
			const mapping = await Array.fromAsync(this.#fetchAchievementsMapping(appId));
			const icons = new Map(mapping);
			for await (const achievement of this.#fetchAchievements(appId)) {
				if (!achievement.achieved) continue;
				const { unlockTime, apiName } = achievement;
				if (unlockTime < since) continue;
				const icon =
					icons.get(apiName) ??
					Reflect.mapUndefined(imgIconUrl, url => `http://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${url}.jpg`) ??
					null;
				const url = `https://steamcommunity.com/stats/${appId}/achievements`;
				yield new SteamAchievementActivity(this.name, unlockTime, game.name, webpage, icon, achievement.name ?? apiName, achievement.description ?? null, url);
			}
		}
	}
}
//#endregion
