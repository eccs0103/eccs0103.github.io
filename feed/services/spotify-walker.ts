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

	async #authenticate(): Promise<SpotifyToken> {
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

	async *#fetchPage(token: SpotifyToken, page: number, count: number): AsyncIterable<SpotifySaveEvent> {
		const url = new URL("https://api.spotify.com/v1/me/tracks");
		url.searchParams.set("limit", String(count));
		url.searchParams.set("offset", String((page - 1) * count));
		const headers: HeadersInit = {
			["Authorization"]: `Bearer ${token.accessToken}`
		};
		const response = await fetch(url, { headers });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const data = await response.json();
		const collection = SpotifySavesCollection.import(data, "spotify_saves_collection");
		yield* collection.items;
	}

	async *#readTracks(token: SpotifyToken, since: Date): AsyncIterable<SpotifySaveEvent> {
		let page = 1;
		const count = 50;
		while (true) {
			let items = 0;
			for await (const event of this.#fetchPage(token, page, count)) {
				const date = new Date(event.addedAt);
				if (date < since) return;
				items++;
				yield event;
			}
			if (items < count) return;
			page++;
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		const token = await this.#authenticate();
		for await (const event of this.#readTracks(token, since)) {
			const { track, addedAt } = event;
			const platform = this.name;
			const timestamp = new Date(addedAt);
			const title = track.name;
			const artists = track.artists.map(artist => artist.name);
			const cover = track.album.images.at(0)?.url ?? null;
			const url = track.externalUrls.spotify;
			yield new SpotifyLikeActivity(platform, timestamp, title, artists, cover, url);
		}
	}
}
//#endregion
