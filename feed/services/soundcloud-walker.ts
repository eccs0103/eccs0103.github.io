"use strict";

import "adaptive-extender/node";
import { Nullable } from "adaptive-extender/node";
import { ActivityWalker, AuthorizationExpiredError } from "./activity-walker.js";
import { SoundCloudTokenStore } from "./soundcloud-token-store.js";
import { SoundCloudToken, SoundCloudTokenError, SoundCloudTrack, SoundCloudTrackCollection, SoundCloudUser } from "../models/soundcloud-event.js";
import { Activity, SoundCloudLikeActivity, SoundCloudUploadActivity } from "../models/activity.js";

const meta = import.meta;

//#region SoundCloud walker
export class SoundCloudWalker extends ActivityWalker {
	#clientId: string;
	#clientSecret: string;
	#username: string;
	#store: SoundCloudTokenStore;

	constructor(clientId: string, clientSecret: string, key: string, token: string, username: string) {
		super("SoundCloud");
		this.#clientId = clientId;
		this.#clientSecret = clientSecret;
		this.#store = new SoundCloudTokenStore(new URL("../../resources/data/soundcloud-token.json", meta.url), key, token);
		this.#username = username;
	}

	static async #isInvalidGrant(data: unknown): Promise<boolean> {
		try {
			const error = SoundCloudTokenError.import(data, "soundcloud_token_error");
			return error.error === "invalid_grant";
		} catch {
			return false;
		}
	}

	async #authenticate(refreshToken: string): Promise<SoundCloudToken> {
		const url = new URL("https://secure.soundcloud.com/oauth/token");
		const method = "POST";
		const headers: Record<string, string> = {
			["Content-Type"]: "application/x-www-form-urlencoded",
			["Accept"]: "application/json; charset=utf-8"
		};
		const query: Record<string, string> = {
			["grant_type"]: "refresh_token",
			["client_id"]: this.#clientId,
			["client_secret"]: this.#clientSecret,
			["refresh_token"]: refreshToken
		};
		const body = new URLSearchParams(query);
		const response = await fetch(url, { method, headers, body });
		const data = await response.json();
		if (!response.ok) {
			if (await SoundCloudWalker.#isInvalidGrant(data)) throw new AuthorizationExpiredError(this.name, "the refresh token was rejected (invalid_grant); re-authorization is required");
			throw new Error(`${response.status}: ${response.statusText}`);
		}
		return SoundCloudToken.import(data, "soundcloud_token");
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
		const store = this.#store;
		const refreshToken = await store.read();
		const token = await this.#authenticate(refreshToken);
		if (token.refreshToken !== undefined && token.refreshToken !== refreshToken) await store.write(token.refreshToken);
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
