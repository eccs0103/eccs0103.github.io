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
		const url = new URL("https://api.soundcloud.com/oauth2/token");
		const method = "POST";
		const body = new URLSearchParams({
			["grant_type"]: "refresh_token",
			["client_id"]: this.#clientId,
			["client_secret"]: this.#clientSecret,
			["refresh_token"]: this.#refreshToken
		});
		const response = await fetch(url, { method, body });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		return SoundCloudToken.import(await response.json(), "soundcloud_token");
	}

	async *#fetchTracks(token: SoundCloudToken, since: Date): AsyncIterable<SoundCloudLikeEvent> {
		let nextHref: string | null = null;

		while (true) {
			const target: URL = nextHref ? new URL(nextHref) : new URL("https://api.soundcloud.com/me/favorites?linked_partitioning=1&limit=50");
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
		for await (const track of this.#fetchTracks(token, since)) {
			const platform = this.name;
			const timestamp = track.createdAt;
			const { title, user } = track;
			const artist = user.username;
			const cover = track.artworkUrl ?? user.avatarUrl;
			const url = track.permalinkUrl;
			yield new SoundCloudLikeActivity(platform, timestamp, title, artist, cover, url);
		}
	}
}
//#endregion
