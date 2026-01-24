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
	appId: number;
	name: string;
	playtimeForever: number;
	imgIconUrl: string | undefined;
	playtimeWindowsForever: number | undefined;
	playtimeMacForever: number | undefined;
	playtimeLinuxForever: number | undefined;
	rtimeLastPlayed: Date;
	hasCommunityVisibleStats: boolean | undefined;

	constructor(appId: number, name: string, playtimeForever: number, imgIconUrl: string | undefined, playtimeWindowsForever: number | undefined, playtimeMacForever: number | undefined, playtimeLinuxForever: number | undefined, rtimeLastPlayed: Date, hasCommunityVisibleStats: boolean | undefined) {
		this.appId = appId;
		this.name = name;
		this.playtimeForever = playtimeForever;
		this.imgIconUrl = imgIconUrl;
		this.playtimeWindowsForever = playtimeWindowsForever;
		this.playtimeMacForever = playtimeMacForever;
		this.playtimeLinuxForever = playtimeLinuxForever;
		this.rtimeLastPlayed = rtimeLastPlayed;
		this.hasCommunityVisibleStats = hasCommunityVisibleStats;
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
		const rtimeLastPlayed = new Date(Number.import(Reflect.get(object, "rtime_last_played"), `${name}.rtime_last_played`) * 1000);
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
		const rtime_last_played = Number(source.rtimeLastPlayed) / 1000;
		const has_community_visible_stats = source.hasCommunityVisibleStats;
		return { appid, name, playtime_forever, img_icon_url, playtime_windows_forever, playtime_mac_forever, playtime_linux_forever, rtime_last_played, has_community_visible_stats };
	}
}
//#endregion

//#region Steam owned games
export interface SteamOwnedGamesScheme {
	game_count?: number; /** Количество игр */
	games?: SteamGameScheme[]; /** Список игр */
}

export class SteamOwnedGames {
	gameCount: number | undefined;
	games: SteamGame[] | undefined;

	constructor(gameCount: number | undefined, games: SteamGame[] | undefined) {
		this.gameCount = gameCount;
		this.games = games;
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
}
//#endregion

//#region Steam owned games container
export interface SteamOwnedGamesContainerScheme {
	response: SteamOwnedGamesScheme;
}

export class SteamOwnedGamesContainer {
	response: SteamOwnedGames;

	constructor(response: SteamOwnedGames) {
		this.response = response;
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
}
//#endregion

//#region Steam game schema stats achievement
export interface SteamGameSchemaStatsAchievementScheme {
	name: string; /** Технический ID (напр. "NEW_ACHIEVEMENT_1_0"). Совпадает с apiname в stats. */
	// defaultvalue: number;  /** Начальное значение (обычно 0). */
	displayName?: string; /** Отображаемое название (может отсутствовать). */
	// hidden: number; /** Скрытая ачивка (0 или 1). */
	description?: string; /** Описание (может отсутствовать). */
	icon: string; /** URL цветной иконки (64x64). */
	// icongray: string; /** URL серой иконки (64x64). */
}

export class SteamGameSchemaStatsAchievement {
	name: string;
	displayName: string | undefined;
	description: string | undefined;
	icon: string;

	constructor(name: string, displayName: string | undefined, description: string | undefined, icon: string) {
		this.name = name;
		this.displayName = displayName;
		this.description = description;
		this.icon = icon;
	}

	static import(source: any, name: string): SteamGameSchemaStatsAchievement {
		const object = Object.import(source, name);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const displayName = Reflect.mapUndefined(Reflect.get(object, "displayName") as unknown, displayName => String.import(displayName, `${name}.displayName`));
		const description = Reflect.mapUndefined(Reflect.get(object, "description") as unknown, description => String.import(description, `${name}.description`));
		const icon = String.import(Reflect.get(object, "icon"), `${name}.icon`);
		return new SteamGameSchemaStatsAchievement($name, displayName, description, icon);
	}

	static export(source: SteamGameSchemaStatsAchievement): SteamGameSchemaStatsAchievementScheme {
		const name = source.name;
		const displayName = source.displayName;
		const description = source.description;
		const icon = source.icon;
		return { name, displayName, description, icon };
	}
}
//#endregion

//#region Steam game schema stats
export interface SteamGameSchemaStatsScheme {
	achievements?: SteamGameSchemaStatsAchievementScheme[]; /** Список ачивок. Может отсутствовать, если есть только стата (килы/смерти), но нет ачивок. */
}

export class SteamGameSchemaStats {
	achievements: SteamGameSchemaStatsAchievement[] | undefined;

	constructor(achievements: SteamGameSchemaStatsAchievement[] | undefined) {
		this.achievements = achievements;
	}

	static import(source: any, name: string): SteamGameSchemaStats {
		const object = Object.import(source, name);
		const achievements = Reflect.mapUndefined(Reflect.get(object, "achievements") as unknown, achievements => Array.import(Reflect.get(object, "achievements"), `${name}.achievements`).map((item, index) => {
			return SteamGameSchemaStatsAchievement.import(item, `${name}.achievements[${index}]`);
		}));
		const result = new SteamGameSchemaStats(achievements);
		return result;
	}

	static export(source: SteamGameSchemaStats): SteamGameSchemaStatsScheme {
		const achievements = Reflect.mapUndefined(source.achievements, achievements => achievements.map(SteamGameSchemaStatsAchievement.export));
		return { achievements };
	}
}
//#endregion

//#region Steam game schema
export interface SteamGameSchemaScheme {
	// gameName: string; /** Название игры в базе Steam. */
	// gameVersion: string; /** Версия данных. */
	availableGameStats?: SteamGameSchemaStatsScheme; /** Доступная статистика. @undefined Если у игры нет публичной статистики или ачивок. */
}

export class SteamGameSchema {
	availableGameStats: SteamGameSchemaStats | undefined;

	constructor(availableGameStats: SteamGameSchemaStats | undefined) {
		this.availableGameStats = availableGameStats;
	}

	static import(source: any, name: string): SteamGameSchema {
		const object = Object.import(source, name);
		const availableGameStats = Reflect.mapUndefined(Reflect.get(object, "availableGameStats") as unknown, availableGameStats => SteamGameSchemaStats.import(availableGameStats, `${name}.availableGameStats`));
		const result = new SteamGameSchema(availableGameStats);
		return result;
	}

	static export(source: SteamGameSchema): SteamGameSchemaScheme {
		const availableGameStats = Reflect.mapUndefined(source.availableGameStats, availableGameStats => SteamGameSchemaStats.export(availableGameStats));
		return { availableGameStats };
	}
}
//#endregion

//#region Steam game schema container
export interface SteamGameSchemaContainerScheme {
	game: SteamGameSchemaScheme;
}

export class SteamGameSchemaContainer {
	game: SteamGameSchema;

	constructor(game: SteamGameSchema) {
		this.game = game;
	}

	static import(source: any, name: string): SteamGameSchemaContainer {
		const object = Object.import(source, name);
		const game = SteamGameSchema.import(Reflect.get(object, "game"), `${name}.game`);
		const result = new SteamGameSchemaContainer(game);
		return result;
	}

	static export(source: SteamGameSchemaContainer): SteamGameSchemaContainerScheme {
		const game = SteamGameSchema.export(source.game);
		return { game };
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
	apiName: string;
	achieved: boolean;
	unlockTime: Date;
	name: string | undefined;
	description: string | undefined;

	constructor(apiName: string, achieved: boolean, unlockTime: Date, name: string | undefined, description: string | undefined) {
		this.apiName = apiName;
		this.achieved = achieved;
		this.unlockTime = unlockTime;
		this.name = name;
		this.description = description;
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
		const unlocktime = Number(source.unlockTime) / 1000;
		const name = source.name;
		const description = source.description;
		return { apiname, achieved, unlocktime, name, description };
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
	steamId: string | undefined;
	gameName: string | undefined;
	achievements: SteamAchievement[] | undefined;
	success: boolean;
	error: string | undefined;

	constructor(steamId: string | undefined, gameName: string | undefined, achievements: SteamAchievement[] | undefined, success: boolean, error: string | undefined) {
		this.steamId = steamId;
		this.gameName = gameName;
		this.achievements = achievements;
		this.success = success;
		this.error = error;
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
}
//#endregion

//#region Steam player stats container
export interface SteamPlayerStatsContainerScheme {
	playerstats: SteamPlayerStatsScheme;
}

export class SteamPlayerStatsContainer {
	playerStats: SteamPlayerStats;

	constructor(playerStats: SteamPlayerStats) {
		this.playerStats = playerStats;
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
}
//#endregion

//#region Steam published file
export interface SteamPublishedFileScheme {
	// publishedfileid: string; // Уникальный ID опубликованного файла (строка, так как uint64)
	// creator: string; // SteamID автора (строка)
	// creator_app_id: number; // ID приложения, через которое загружено (например, Steam Cloud)
	consumer_app_id: number; // ID игры, к которой относится скриншот
	// filename: string; // Имя файла на сервере (редко нужно для логики)
	// file_size: number; // Размер файла в байтах
	file_url?: string; // Прямая ссылка на полный скриншот (может отсутствовать, если доступ закрыт/удалено)
	// hcontent_file?: string; // Хэш контента файла (внутренний механизм Steam)
	preview_url?: string; // Ссылка на превью/миниатюру (обычно есть всегда)
	// hcontent_preview?: string; // Хэш превью
	title: string; // Заголовок/описание, которое дал пользователь
	// description: string; // Дополнительное описание (часто пустое для скриншотов)
	time_created: number; // Время публикации (Unix Timestamp)
	// time_updated: number; // Время последнего обновления (Unix Timestamp)
	visibility: number; // Уровень приватности (0 = Public, 1 = FriendsOnly, 2 = Private)
	banned: number; // Флаг бана (1 = забанен модерацией)
	// ban_reason?: string; // Причина бана (если banned = 1)
	// subscriptions: number; // Количество подписок (для Workshop, у скриншотов обычно 0)
	// favorited: number; // Количество добавлений в избранное
	// lifetime_subscriptions: number; // Подписки за все время
	// lifetime_favorited: number; // Избранное за все время
	// views: number; // Количество просмотров
}

export class SteamPublishedFile {
	consumerAppId: number;
	fileUrl: string | undefined;
	previewUrl: string | undefined;
	title: string;
	timeCreated: Date;
	visibility: number;
	banned: boolean;

	constructor(consumerAppId: number, fileUrl: string | undefined, previewUrl: string | undefined, title: string, timeCreated: Date, visibility: number, banned: boolean) {
		this.consumerAppId = consumerAppId;
		this.fileUrl = fileUrl;
		this.previewUrl = previewUrl;
		this.title = title;
		this.timeCreated = timeCreated;
		this.visibility = visibility;
		this.banned = banned;
	}

	static import(source: any, name: string): SteamPublishedFile {
		const object = Object.import(source, name);
		const consumerAppId = Number.import(Reflect.get(object, "consumer_app_id"), `${name}.consumer_app_id`);
		const fileUrl = Reflect.mapUndefined(Reflect.get(object, "file_url") as unknown, fileUrl => String.import(fileUrl, `${name}.file_url`));
		const previewUrl = Reflect.mapUndefined(Reflect.get(object, "preview_url") as unknown, previewUrl => String.import(previewUrl, `${name}.preview_url`));
		const title = String.import(Reflect.get(object, "title"), `${name}.title`);
		const timeCreated = new Date(Number.import(Reflect.get(object, "time_created"), `${name}.time_created`) * 1000);
		const visibility = Number.import(Reflect.get(object, "visibility"), `${name}.visibility`);
		const banned = Boolean(Number.import(Reflect.get(object, "banned"), `${name}.banned`));
		const result = new SteamPublishedFile(consumerAppId, fileUrl, previewUrl, title, timeCreated, visibility, banned);
		return result;
	}

	static export(source: SteamPublishedFile): SteamPublishedFileScheme {
		const consumer_app_id = source.consumerAppId;
		const file_url = source.fileUrl;
		const preview_url = source.previewUrl;
		const title = source.title;
		const time_created = Number(source.timeCreated) / 1000;
		const visibility = source.visibility;
		const banned = Number(source.banned);
		return { consumer_app_id, file_url, preview_url, title, time_created, visibility, banned };
	}
}
//#endregion

//#region Steam user files response
export interface SteamUserFilesResponseScheme {
	// total: number; // Общее количество файлов у пользователя (для пагинации)
	publishedfiledetails?: SteamPublishedFileScheme[]; // Массив самих файлов (может быть пустым)
}

export class SteamUserFilesResponse {
	publishedFileDetails: SteamPublishedFile[] | undefined;

	constructor(publishedFileDetails: SteamPublishedFile[] | undefined) {
		this.publishedFileDetails = publishedFileDetails;
	}

	static import(source: any, name: string): SteamUserFilesResponse {
		const object = Object.import(source, name);
		const publishedFileDetails = Reflect.mapUndefined(Reflect.get(object, "publishedfiledetails") as unknown, publishedfiledetails => Array.import(Reflect.get(object, "publishedfiledetails"), `${name}.publishedfiledetails`).map((item, index) => {
			return SteamPublishedFile.import(item, `${name}.publishedfiledetails[${index}]`);
		}));
		const result = new SteamUserFilesResponse(publishedFileDetails);
		return result;
	}

	static export(source: SteamUserFilesResponse): SteamUserFilesResponseScheme {
		const publishedfiledetails = Reflect.mapUndefined(source.publishedFileDetails, publishedFileDetails => publishedFileDetails.map(SteamPublishedFile.export));
		return { publishedfiledetails };
	}
}
//#endregion

//#region Steam user files response container
export interface SteamUserFilesResponseContainerScheme {
	response: SteamUserFilesResponseScheme;
}

export class SteamUserFilesResponseContainer {
	response: SteamUserFilesResponse;

	constructor(response: SteamUserFilesResponse) {
		this.response = response;
	}

	static import(source: any, name: string): SteamUserFilesResponseContainer {
		const object = Object.import(source, name);
		const response = SteamUserFilesResponse.import(Reflect.get(object, "response"), `${name}.response`);
		const result = new SteamUserFilesResponseContainer(response);
		return result;
	}

	static export(source: SteamUserFilesResponseContainer): SteamUserFilesResponseContainerScheme {
		const response = SteamUserFilesResponse.export(source.response);
		return { response };
	}
}
//#endregion
