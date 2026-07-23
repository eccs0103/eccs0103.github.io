"use strict";

import "adaptive-extender/node";
import { ActivityWalker, AuthorizationExpiredError } from "./activity-walker.js";
import { SpotifySaveEvent, SpotifySavesCollection, SpotifyToken, SpotifyTokenError } from "../models/spotify-event.js";
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

	static async #isInvalidGrant(data: unknown): Promise<boolean> {
		try {
			const error = SpotifyTokenError.import(data, "spotify_token_error");
			return error.error === "invalid_grant";
		} catch {
			return false;
		}
	}

	async #authenticate(): Promise<SpotifyToken> {
		const url = new URL("https://accounts.spotify.com/api/token");
		const method = "POST";
		const auth = Buffer.from(`${this.#clientId}:${this.#clientSecret}`).toString("base64");
		const headers: Record<string, string> = {
			["Authorization"]: `Basic ${auth}`,
			["Content-Type"]: "application/x-www-form-urlencoded"
		};
		const query: Record<string, string> = {
			["grant_type"]: "refresh_token",
			["refresh_token"]: this.#refreshToken
		};
		const body = new URLSearchParams(query);
		const response = await fetch(url, { method, headers, body });
		const data = await response.json();
		if (!response.ok) {
			if (await SpotifyWalker.#isInvalidGrant(data)) throw new AuthorizationExpiredError(this.name, "the refresh token was rejected (invalid_grant); re-authorization is required");
			throw new Error(`${response.status}: ${response.statusText}`);
		}
		return SpotifyToken.import(data, "spotify_token");
	}

	async *#fetchPaginated(token: SpotifyToken, page: number, count: number): AsyncIterable<any> {
		const url = new URL("https://api.spotify.com/v1/me/tracks");
		url.searchParams.set("limit", String(count));
		url.searchParams.set("offset", String((page - 1) * count));
		const headers: Record<string, string> = {
			["Authorization"]: `Bearer ${token.accessToken}`
		};
		const response = await fetch(url, { headers });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const data = await response.json();
		const collection = SpotifySavesCollection.import(data, "spotify_saves_collection");
		yield* collection.items;
	}

	async *#fetchTracks(token: SpotifyToken, since: Date): AsyncIterable<SpotifySaveEvent> {
		const chunk = 50;
		let page = 1;
		while (true) {
			let index = 0;
			for await (const item of this.#fetchPaginated(token, page, chunk)) {
				try {
					const event = SpotifySaveEvent.import(item, `spotify_saves_collection[${index++}]`);
					if (event.addedAt < since) return;
					yield event;
				} catch (reason) {
					console.error(reason);
				}
			}
			if (index < chunk) return;
			page++;
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		const token = await this.#authenticate();
		for await (const event of this.#fetchTracks(token, since)) {
			const { track } = event;
			const platform = this.name;
			const timestamp = event.addedAt;
			const title = track.name;
			const artists = track.artists.map(artist => artist.name);
			const cover = track.album.images.at(0)?.url ?? null;
			const url = track.externalUrls.spotify;
			yield new SpotifyLikeActivity(platform, timestamp, title, artists, cover, url);
		}
	}
}
//#endregion
