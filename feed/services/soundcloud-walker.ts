"use strict";

import "adaptive-extender/node";
import { Nullable } from "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { SoundCloudToken, SoundCloudTrack, SoundCloudTrackCollection, SoundCloudUser } from "../models/soundcloud-event.js";
import { Activity, SoundCloudLikeActivity, SoundCloudUploadActivity } from "../models/activity.js";

//#region SoundCloud walker
export class SoundCloudWalker extends ActivityWalker {
	#clientId: string;
	#clientSecret: string;
	#username: string;

	constructor(clientId: string, clientSecret: string, username: string) {
		super("SoundCloud");
		this.#clientId = clientId;
		this.#clientSecret = clientSecret;
		this.#username = username;
	}

	async #authenticate(): Promise<SoundCloudToken> {
		const url = new URL("https://secure.soundcloud.com/oauth/token");
		const method = "POST";
		const auth = Buffer.from(`${this.#clientId}:${this.#clientSecret}`).toString("base64");
		const headers: Record<string, string> = {
			["Authorization"]: `Basic ${auth}`,
			["Content-Type"]: "application/x-www-form-urlencoded",
			["Accept"]: "application/json; charset=utf-8"
		};
		const body = new URLSearchParams({ ["grant_type"]: "client_credentials" });
		const response = await fetch(url, { method, headers, body });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		return SoundCloudToken.import(await response.json(), "soundcloud_token");
	}

	async #resolveUserId(token: SoundCloudToken): Promise<number> {
		const url = new URL("https://api.soundcloud.com/resolve");
		url.searchParams.set("url", `https://soundcloud.com/${this.#username}`);
		const headers: Record<string, string> = {
			["Authorization"]: `${token.tokenType} ${token.accessToken}`
		};
		const response = await fetch(url, { headers });
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const user = SoundCloudUser.import(await response.json(), "soundcloud_user");
		return user.id;
	}

	async *#fetchPaginated(token: SoundCloudToken, url: URL, count: number): AsyncIterable<SoundCloudTrack> {
		let next: URL | null = new URL(url);
		next.searchParams.set("linked_partitioning", "true");
		next.searchParams.set("limit", String(count));
		const headers: Record<string, string> = {
			["Authorization"]: `${token.tokenType} ${token.accessToken}`
		};
		while (next !== null) {
			const response = await fetch(next, { headers });
			if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
			const page = SoundCloudTrackCollection.import(await response.json(), "soundcloud_track_collection");
			yield* page.collection;
			next = Nullable.map(page.nextHref, href => new URL(href));
		}
	}

	async *#fetchTracks(token: SoundCloudToken, id: number, path: string, since: Date): AsyncIterable<SoundCloudTrack> {
		const url = new URL(`https://api.soundcloud.com/users/${id}/${path}`);
		for await (const track of this.#fetchPaginated(token, url, 50)) {
			if (track.createdAt < since) return;
			yield track;
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		const token = await this.#authenticate();
		const id = await this.#resolveUserId(token);
		const platform = this.name;

		for await (const track of this.#fetchTracks(token, id, "tracks", since)) {
			const { title, permalinkUrl: url, artworkUrl: artwork, createdAt: timestamp, user: { username: publisher } } = track;
			yield new SoundCloudUploadActivity(platform, timestamp, title, publisher, artwork, url);
		}

		for await (const track of this.#fetchTracks(token, id, "likes/tracks", since)) {
			const { title, permalinkUrl: url, artworkUrl: artwork, createdAt: timestamp, user: { username: publisher } } = track;
			yield new SoundCloudLikeActivity(platform, timestamp, title, publisher, artwork, url);
		}
	}
}
//#endregion
