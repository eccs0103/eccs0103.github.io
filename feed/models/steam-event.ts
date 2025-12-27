"use strict";

import "adaptive-extender/core";

//#region Steam game
export interface SteamGameScheme {
	appid: number; /** Уникальный ID игры */
	name: string; /** Название игры */
	playtime_forever: number; /** Общее время в игре (минуты) */
	img_icon_url?: string; /** Хэш иконки (для построения URL) */
	playtime_windows_forever?: number; /** Время в игре на Windows (минуты) */
	playtime_mac_forever?: number; /** Время в игре на Mac (минуты) */
	playtime_linux_forever?: number; /** Время в игре на Linux (минуты) */
	rtime_last_played: number; /** Время последнего запуска (Unix Timestamp) */
	has_community_visible_stats?: boolean; /** Доступна ли статистика сообщества (ачивки) */
}

export class SteamGame {
	#appId: number;
	#name: string;
	#playtimeForever: number;
	#imgIconUrl: string | undefined;
	#playtimeWindowsForever: number | undefined;
	#playtimeMacForever: number | undefined;
	#playtimeLinuxForever: number | undefined;
	#rtimeLastPlayed: Date;
	#hasCommunityVisibleStats: boolean | undefined;

	constructor(appId: number, name: string, playtimeForever: number, imgIconUrl: string | undefined, playtimeWindowsForever: number | undefined, playtimeMacForever: number | undefined, playtimeLinuxForever: number | undefined, rtimeLastPlayed: Date, hasCommunityVisibleStats: boolean | undefined) {
		this.#appId = appId;
		this.#name = name;
		this.#playtimeForever = playtimeForever;
		this.#imgIconUrl = imgIconUrl;
		this.#playtimeWindowsForever = playtimeWindowsForever;
		this.#playtimeMacForever = playtimeMacForever;
		this.#playtimeLinuxForever = playtimeLinuxForever;
		this.#rtimeLastPlayed = rtimeLastPlayed;
		this.#hasCommunityVisibleStats = hasCommunityVisibleStats;
	}

	static import(source: any, name: string): SteamGame {
		const object = Object.import(source, name);
		const appId = Number.import(Reflect.get(object, "appid"), `${name}.appid`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const playtimeForever = Number.import(Reflect.get(object, "playtime_forever"), `${name}.playtime_forever`);
		const imgIconUrl = Reflect.mapUndefined(Reflect.get(object, "img_icon_url") as unknown, imgIconUrl => String.import(imgIconUrl, `${name}.img_icon_url`));
		const playtimeWindowsForever = Reflect.mapUndefined(Reflect.get(object, "playtime_windows_forever") as unknown, playtimeWindowsForever => Number.import(playtimeWindowsForever, `${name}.playtime_windows_forever`));
		const playtimeMacForever = Reflect.mapUndefined(Reflect.get(object, "playtime_mac_forever") as unknown, playtimeMacForever => Number.import(playtimeMacForever, `${name}.playtime_mac_forever`));
		const playtimeLinuxForever = Reflect.mapUndefined(Reflect.get(object, "playtime_linux_forever") as unknown, playtimeLinuxForever => Number.import(playtimeLinuxForever, `${name}.playtime_linux_forever`));
		const rtimeLastPlayed = new Date(Number.import(Reflect.get(object, "rtime_last_played"), `${name}.rtime_last_played`));
		const hasCommunityVisibleStats = Reflect.mapUndefined(Reflect.get(object, "has_community_visible_stats") as unknown, hasCommunityVisibleStats => Boolean.import(hasCommunityVisibleStats, `${name}.has_community_visible_stats`));
		const result = new SteamGame(appId, $name, playtimeForever, imgIconUrl, playtimeWindowsForever, playtimeMacForever, playtimeLinuxForever, rtimeLastPlayed, hasCommunityVisibleStats);
		return result;
	}

	static export(source: SteamGame): SteamGameScheme {
		const appid = source.appId;
		const name = source.name;
		const playtime_forever = source.playtimeForever;
		const img_icon_url = source.imgIconUrl;
		const playtime_windows_forever = source.playtimeWindowsForever;
		const playtime_mac_forever = source.playtimeMacForever;
		const playtime_linux_forever = source.playtimeLinuxForever;
		const rtime_last_played = Number(source.rtimeLastPlayed);
		const has_community_visible_stats = source.hasCommunityVisibleStats;
		return { appid, name, playtime_forever, img_icon_url, playtime_windows_forever, playtime_mac_forever, playtime_linux_forever, rtime_last_played, has_community_visible_stats };
	}

	get appId(): number {
		return this.#appId;
	}

	get name(): string {
		return this.#name;
	}

	get playtimeForever(): number {
		return this.#playtimeForever;
	}

	get imgIconUrl(): string | undefined {
		return this.#imgIconUrl;
	}

	get playtimeWindowsForever(): number | undefined {
		return this.#playtimeWindowsForever;
	}

	get playtimeMacForever(): number | undefined {
		return this.#playtimeMacForever;
	}

	get playtimeLinuxForever(): number | undefined {
		return this.#playtimeLinuxForever;
	}

	get rtimeLastPlayed(): Date {
		return this.#rtimeLastPlayed;
	}

	get hasCommunityVisibleStats(): boolean | undefined {
		return this.#hasCommunityVisibleStats;
	}
}
//#endregion

//#region Steam owned games
export interface SteamOwnedGamesScheme {
	game_count?: number; /** Количество игр */
	games?: SteamGameScheme[]; /** Список игр */
}

export class SteamOwnedGames {
	#gameCount: number | undefined;
	#games: SteamGame[] | undefined;

	constructor(gameCount: number | undefined, games: SteamGame[] | undefined) {
		this.#gameCount = gameCount;
		this.#games = games;
	}

	static import(source: any, name: string): SteamOwnedGames {
		const object = Object.import(source, name);
		const gameCount = Reflect.mapUndefined(Reflect.get(object, "game_count") as unknown, gameCount => Number.import(gameCount, `${name}.game_count`));
		const games = Reflect.mapUndefined(Reflect.get(object, "games") as unknown, games => Array.import(Reflect.get(object, "games"), `${name}.games`).map((item, index) => {
			return SteamGame.import(item, `${name}.games[${index}]`);
		}));
		const result = new SteamOwnedGames(gameCount, games);
		return result;
	}

	static export(source: SteamOwnedGames): SteamOwnedGamesScheme {
		const game_count = source.gameCount;
		const games = Reflect.mapUndefined(source.games, games => games.map(SteamGame.export));
		return { game_count, games };
	}

	get gameCount(): number | undefined {
		return this.#gameCount;
	}

	get games(): SteamGame[] | undefined {
		return this.#games;
	}
}
//#endregion

//#region Steam owned games container
export interface SteamOwnedGamesContainerScheme {
	response: SteamOwnedGamesScheme;
}

export class SteamOwnedGamesContainer {
	#response: SteamOwnedGames;

	constructor(response: SteamOwnedGames) {
		this.#response = response;
	}

	static import(source: any, name: string): SteamOwnedGamesContainer {
		const object = Object.import(source, name);
		const response = SteamOwnedGames.import(Reflect.get(object, "response"), `${name}.response`);
		const result = new SteamOwnedGamesContainer(response);
		return result;
	}

	static export(source: SteamOwnedGamesContainer): SteamOwnedGamesContainerScheme {
		const response = SteamOwnedGames.export(source.response);
		return { response };
	}

	get response(): SteamOwnedGames {
		return this.#response;
	}
}
//#endregion

//#region Steam achievement
export interface SteamAchievementScheme {
	apiname: string; /** Техническое имя ачивки (NEW_ACHIEVEMENT_1_0) */
	achieved: number; /** Статус получения (1 - получено, 0 - нет) */
	unlocktime: number; /** Время получения (Unix Timestamp) */
	name?: string; /** Локализованное название (может отсутствовать) */
	description?: string; /** Локализованное описание (может отсутствовать) */
}

export class SteamAchievement {
	#apiName: string;
	#achieved: boolean;
	#unlockTime: Date;
	#name: string | undefined;
	#description: string | undefined;

	constructor(apiName: string, achieved: boolean, unlockTime: Date, name: string | undefined, description: string | undefined) {
		this.#apiName = apiName;
		this.#achieved = achieved;
		this.#unlockTime = unlockTime;
		this.#name = name;
		this.#description = description;
	}

	static import(source: any, name: string): SteamAchievement {
		const object = Object.import(source, name);
		const apiName = String.import(Reflect.get(object, "apiname"), `${name}.apiname`);
		const achieved = Boolean(Number.import(Reflect.get(object, "achieved"), `${name}.achieved`));
		const unlockTime = new Date(Number.import(Reflect.get(object, "unlocktime"), `${name}.unlocktime`) * 1000);
		const $name = Reflect.mapUndefined(Reflect.get(object, "name") as unknown, name => String.import(name, `${name}.name`));
		const description = Reflect.mapUndefined(Reflect.get(object, "description") as unknown, description => String.import(description, `${name}.description`));
		const result = new SteamAchievement(apiName, achieved, unlockTime, $name, description);
		return result;
	}

	static export(source: SteamAchievement): SteamAchievementScheme {
		const apiname = source.apiName;
		const achieved = Number(source.achieved);
		const unlocktime = Number(source.unlockTime);
		const name = source.name;
		const description = source.description;
		return { apiname, achieved, unlocktime, name, description };
	}

	get apiName(): string {
		return this.#apiName;
	}

	get achieved(): boolean {
		return this.#achieved;
	}

	get unlockTime(): Date {
		return this.#unlockTime;
	}

	get name(): string | undefined {
		return this.#name;
	}

	get description(): string | undefined {
		return this.#description;
	}
}
//#endregion

//#region Steam player stats
export interface SteamPlayerStatsScheme {
	steamID?: string; /** SteamID игрока */
	gameName?: string; /** Техническое название игры */
	achievements?: SteamAchievementScheme[]; /** Список ачивок (может не быть, если у игры их нет) */
	success: boolean; /** Статус успешности запроса */
	error?: string; /** Сообщение об ошибке (если success: false) */
}

export class SteamPlayerStats {
	#steamId: string | undefined;
	#gameName: string | undefined;
	#achievements: SteamAchievement[] | undefined;
	#success: boolean;
	#error: string | undefined;

	constructor(steamId: string | undefined, gameName: string | undefined, achievements: SteamAchievement[] | undefined, success: boolean, error: string | undefined) {
		this.#steamId = steamId;
		this.#gameName = gameName;
		this.#achievements = achievements;
		this.#success = success;
		this.#error = error;
	}

	static import(source: any, name: string): SteamPlayerStats {
		const object = Object.import(source, name);
		const steamId = Reflect.mapUndefined(Reflect.get(object, "steamID") as unknown, steamId => String.import(steamId, `${name}.steamID`));
		const gameName = Reflect.mapUndefined(Reflect.get(object, "gameName") as unknown, gameName => String.import(gameName, `${name}.gameName`));
		const achievements = Reflect.mapUndefined(Reflect.get(object, "achievements") as unknown, achievements => Array.import(Reflect.get(object, "achievements"), `${name}.achievements`).map((item, index) => {
			return SteamAchievement.import(item, `${name}.achievements[${index}]`);
		}));
		const success = Boolean.import(Reflect.get(object, "success"), `${name}.success`);
		const error = Reflect.mapUndefined(Reflect.get(object, "error") as unknown, error => String.import(error, `${name}.error`));
		const result = new SteamPlayerStats(steamId, gameName, achievements, success, error);
		return result;
	}

	static export(source: SteamPlayerStats): SteamPlayerStatsScheme {
		const steamID = source.steamId;
		const gameName = source.gameName;
		const achievements = Reflect.mapUndefined(source.achievements, achievements => achievements.map(SteamAchievement.export));
		const success = source.success;
		const error = source.error;
		return { steamID, gameName, achievements, success, error };
	}

	get steamId(): string | undefined {
		return this.#steamId;
	}

	get gameName(): string | undefined {
		return this.#gameName;
	}

	get achievements(): SteamAchievement[] | undefined {
		return this.#achievements;
	}

	get success(): boolean {
		return this.#success;
	}

	get error(): string | undefined {
		return this.#error;
	}
}
//#endregion

//#region Steam player stats container
export interface SteamPlayerStatsContainerScheme {
	playerstats: SteamPlayerStatsScheme;
}

export class SteamPlayerStatsContainer {
	#playerStats: SteamPlayerStats;

	constructor(playerStats: SteamPlayerStats) {
		this.#playerStats = playerStats;
	}

	static import(source: any, name: string): SteamPlayerStatsContainer {
		const object = Object.import(source, name);
		const playerStats = SteamPlayerStats.import(Reflect.get(object, "playerstats"), `${name}.playerstats`);
		const result = new SteamPlayerStatsContainer(playerStats);
		return result;
	}

	static export(source: SteamPlayerStatsContainer): SteamPlayerStatsContainerScheme {
		const playerstats = SteamPlayerStats.export(source.playerStats);
		return { playerstats };
	}

	get playerStats(): SteamPlayerStats {
		return this.#playerStats;
	}
}
//#endregion
