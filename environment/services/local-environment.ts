"use strict";

import "dotenv/config";
import "adaptive-extender/node";
import { EnvironmentProvider, Field, Model, Optional, RecordOf } from "adaptive-extender/node";

//#region Local environment
class LocalEnviroment extends Model {
	@Field(Optional(String), "HOST")
	host: string | undefined;

	@Field(String, "GOOGLE_SEARCH_ID")
	googleSearchId: string;

	@Field(String, "GOOGLE_API_KEY")
	googleApiKey: string;

	@Field(RecordOf(String), "SPECIFIC_DICTIONARY")
	specialDictionary: Map<string, string>;

	@Field(Date, "ORIGIN")
	origin: Date;

	@Field(String, "GITHUB_USERNAME")
	githubUsername: string;

	@Field(String, "GITHUB_TOKEN")
	githubToken: string;

	@Field(String, "SPOTIFY_CLIENT_ID")
	spotifyClientId: string;

	@Field(String, "SPOTIFY_CLIENT_SECRET")
	spotifyClientSecret: string;

	@Field(String, "SPOTIFY_TOKEN")
	spotifyToken: string;

	@Field(String, "PINTEREST_CLIENT_ID")
	pinterestClientId: string;

	@Field(String, "PINTEREST_CLIENT_SECRET")
	pinterestClientSecret: string;

	@Field(String, "PINTEREST_TOKEN")
	pinterestToken: string;

	@Field(String, "STEAM_ID")
	steamId: string;

	@Field(String, "STEAM_API_KEY")
	steamApiKey: string;

	@Field(String, "STACK_OVERFLOW_ID")
	stackOverflowId: string;

	@Field(String, "STACK_OVERFLOW_API_KEY")
	stackOverflowApiKey: string;

	@Field(String, "SOUND_CLOUD_CLIENT_ID")
	soundCloudClientId: string;

	@Field(String, "SOUND_CLOUD_CLIENT_SECRET")
	soundCloudClientSecret: string;

	@Field(String, "SOUND_CLOUD_TOKEN")
	soundCloudToken: string;

	@Field(Number, "TELEGRAM_CHANNEL_ID")
	telegramChannelId: number;

	@Field(Number, "TELEGRAM_API_ID")
	telegramApiId: number;

	@Field(String, "TELEGRAM_API_HASH")
	telegramApiHash: string;

	@Field(String, "TELEGRAM_SESSION")
	telegramSession: string;
}

export const env = EnvironmentProvider.resolve(process.env, LocalEnviroment);
//#endregion
