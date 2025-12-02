"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { SpotifySavedTrack } from "../models/spotify-event.js";
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

	async #refreshAccessToken(): Promise<string> {
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
		const data: any = await response.json();
		return String.import(data.access_token, "spotify_access_token");
	}

	async *#fetchSavedTracks(accessToken: string, limit: number): AsyncIterable<SpotifySavedTrack> {
		const url = new URL("https://api.spotify.com/v1/me/tracks");
		url.searchParams.set("limit", String(limit));
		const headers: HeadersInit = {
			["Authorization"]: `Bearer ${accessToken}`
		};
		const response = await fetch(url, { headers });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const data: any = await response.json();
		const name = "spotify_items";
		const items = Array.import(data.items, name);
		let index = 0;
		for (const item of items) {
			yield SpotifySavedTrack.import(item, `${name}[${index}]`);
			index++;
		}
	}

	async *crawl(): AsyncIterable<Activity> {
		const accessToken = await this.#refreshAccessToken();
		for await (const event of this.#fetchSavedTracks(accessToken, 20)) {
			const { track, addedAt } = event;
			const timestamp = new Date(addedAt);
			const artistNames = track.artists.map(a => a.name).join(", ");
			yield new SpotifyLikeActivity(this.name, timestamp, track.name, artistNames, track.url);
		}
	}
}
//#endregion