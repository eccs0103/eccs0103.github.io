"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { SoundCloudLikeEvent, SoundCloudLikesCollection, SoundCloudToken } from "../models/soundcloud-event.js";
import { Activity, SoundCloudLikeActivity } from "../models/activity.js";

//#region SoundCloud walker
export class SoundCloudWalker extends ActivityWalker {
	#clientId: string;
	#clientSecret: string;
	#refreshToken: string;

	constructor(clientId: string, clientSecret: string, refreshToken: string) {
		super("SoundCloud");
		this.#clientId = clientId;
		this.#clientSecret = clientSecret;
		this.#refreshToken = refreshToken;
	}

	async #authenticate(): Promise<SoundCloudToken> {
		console.log(`Authenticating SoundCloud...`);
		
		const url = new URL("https://api.soundcloud.com/oauth2/token");
		const method = "POST";
		
		// Ensure values are clean
		const clientId = this.#clientId.trim();
		const clientSecret = this.#clientSecret.trim();
		const refreshToken = this.#refreshToken.trim();

		const headers: HeadersInit = {
			["Content-Type"]: "application/x-www-form-urlencoded"
		};
		
		const body = new URLSearchParams({
			["grant_type"]: "refresh_token",
			["client_id"]: clientId,
			["client_secret"]: clientSecret,
			["refresh_token"]: refreshToken
		});

		const response = await fetch(url, { method, headers, body });
		if (!response.ok) {
			const text = await response.text();
			throw new Error(`Authentication failed: ${response.status} ${response.statusText} - ${text}`);
		}
		
		const data = await response.json();
		const result = SoundCloudToken.import(data, "soundcloud_token");
		
		// SoundCloud rotates refresh tokens. We MUST save/print the new one, 
		// otherwise the next run will fail with invalid_grant.
		if (result.refreshToken && result.refreshToken !== this.#refreshToken) {
			console.log("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			console.log("WARNING: SoundCloud issued a new Refresh Token!");
			console.log("YOU MUST UPDATE YOUR .ENV FILE WITH THIS VALUE FOR THE NEXT RUN:");
			console.log(`SOUNDCLOUD_TOKEN=${result.refreshToken}`);
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
		}
		
		return result;
	}

	async #getUserId(token: SoundCloudToken): Promise<number> {
		const url = "https://api.soundcloud.com/me";
		const headers: HeadersInit = {
			["Authorization"]: `OAuth ${token.accessToken}`
		};
		const response = await fetch(url, { headers });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const data = await response.json();
		return data.id;
	}

	async *#fetchTracks(token: SoundCloudToken, userId: number, since: Date): AsyncIterable<SoundCloudLikeEvent> {
		let nextHref: string | null = null;

		while (true) {
			const target: URL = nextHref ? new URL(nextHref) : new URL(`https://api-v2.soundcloud.com/users/${userId}/likes?limit=50`);
			const headers: HeadersInit = {
				["Authorization"]: `OAuth ${token.accessToken}`
			};

			const response: Response = await fetch(target, { headers });
			if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);

			const data: any = await response.json();
			const collection = SoundCloudLikesCollection.import(data, "soundcloud_likes_collection");

			let index = 0;
			for (const item of collection.items) {
				try {
					if (!item.track) continue;
					const event = SoundCloudLikeEvent.import(item, `soundcloud_likes_collection[${index++}]`);
					if (event.createdAt < since) return;
					yield event;
				} catch (reason) {
					console.error(reason);
				}
			}

			if (!collection.nextHref) return;
			nextHref = collection.nextHref;
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		const token = await this.#authenticate();
		const userId = await this.#getUserId(token);
		for await (const event of this.#fetchTracks(token, userId, since)) {
			const platform = this.name;
			const timestamp = event.createdAt;
			const { track } = event;
			const { title, user } = track;
			const artist = user.username;
			const cover = track.artworkUrl ?? user.avatarUrl;
			const url = track.permalinkUrl;
			yield new SoundCloudLikeActivity(platform, timestamp, title, artist, cover, url);
		}
	}
}
//#endregion
