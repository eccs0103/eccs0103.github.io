"use strict";

import "adaptive-extender/core";
import { Field, Model, Nullable } from "adaptive-extender/core";

//#region SoundCloud token
export interface SoundCloudTokenScheme {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export class SoundCloudToken extends Model {
	@Field(String, { name: "access_token" })
	accessToken: string;

	@Field(String, { name: "token_type" })
	tokenType: string;

	@Field(Number, { name: "expires_in" })
	expiresIn: number;
}
//#endregion

//#region SoundCloud user
export interface SoundCloudUserScheme {
	id: number;
	username: string;
	permalink_url: string;
}

export class SoundCloudUser extends Model {
	@Field(Number, { name: "id" })
	id: number;

	@Field(String, { name: "username" })
	username: string;

	@Field(String, { name: "permalink_url" })
	permalinkUrl: string;
}
//#endregion

//#region SoundCloud track
export interface SoundCloudTrackScheme {
	id: number;
	title: string;
	permalink_url: string;
	artwork_url: string | null;
	created_at: string;
	user: SoundCloudUserScheme;
}

export class SoundCloudTrack extends Model {
	@Field(Number, { name: "id" })
	id: number;

	@Field(String, { name: "title" })
	title: string;

	@Field(String, { name: "permalink_url" })
	permalinkUrl: string;

	@Field(Nullable.Of(String), { name: "artwork_url" })
	artworkUrl: string | null;

	@Field(Date, { name: "created_at" })
	createdAt: Date;

	@Field(SoundCloudUser, { name: "user" })
	user: SoundCloudUser;
}
//#endregion

//#region SoundCloud track collection
export interface SoundCloudTrackCollectionScheme {
	collection: SoundCloudTrackScheme[];
	next_href: string | null;
}

export class SoundCloudTrackCollection extends Model {
	@Field(Array.Of(SoundCloudTrack), { name: "collection" })
	collection: SoundCloudTrack[];

	@Field(Nullable.Of(String), { name: "next_href" })
	nextHref: string | null;
}
//#endregion
