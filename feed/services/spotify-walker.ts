"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { SpotifySaveEvent, SpotifySavesCollection, SpotifyToken } from "../models/spotify-event.js";
import { Activity, SpotifyLikeActivity } from "../models/activity.js";

//#region Spotify walker
export class SpotifyWalker extends ActivityWalker {
	#clientId: string;
	#clientSecret: string;
	#refreshToken: string;

	constructor(clientId: string, clientSecret: string, refreshToken: string) {
		super("Spotify");
		this.#clientId = clientId;
		this.#clientSecret = clientSecret;
		this.#refreshToken = refreshToken;
	}

	async #refreshAccessToken(): Promise<SpotifyToken> {
		const url = new URL("https://accounts.spotify.com/api/token");
		const method = "POST";
		const auth = Buffer.from(`${this.#clientId}:${this.#clientSecret}`).toString("base64");
		const headers: HeadersInit = {
			["Authorization"]: `Basic ${auth}`,
			["Content-Type"]: "application/x-www-form-urlencoded"
		};
		const body = new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: this.#refreshToken
		});
		const response = await fetch(url, { method, headers, body });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		return SpotifyToken.import(await response.json(), "spotify_token");
	}

	async *#fetchSavedTracks(token: SpotifyToken, limit: number): AsyncIterable<SpotifySaveEvent> {
		const url = new URL("https://api.spotify.com/v1/me/tracks");
		url.searchParams.set("limit", String(limit));
		const headers: HeadersInit = {
			["Authorization"]: `Bearer ${token.accessToken}`
		};
		const response = await fetch(url, { headers });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const collection = SpotifySavesCollection.import(await response.json(), "spotify_saves_collection");
		for (const event of collection.items) {
			yield event;
		}
	}

	async *crawl(): AsyncIterable<Activity> {
		const accessToken = await this.#refreshAccessToken();
		for await (const event of this.#fetchSavedTracks(accessToken, 20)) {
			const { track, addedAt } = event;
			const timestamp = new Date(addedAt);
			yield new SpotifyLikeActivity(this.name, timestamp, track.name, track.artists.map(artist => artist.name).join(", "), track.album.images[0].url, track.uri);
		}
	}
}
//#endregion
