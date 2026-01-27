"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Nullable, Model, Any } from "adaptive-extender/core";

//#region SoundCloud token
export interface SoundCloudTokenScheme {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
	refresh_token: string;
}

export class SoundCloudToken extends Model {
	@Field(String, "access_token")
	accessToken: string;

	@Field(String, "token_type")
	tokenType: string;

	@Field(Number, "expires_in")
	expiresIn: number;

	@Field(String, "scope")
	scope: string;

	@Field(String, "refresh_token")
	refreshToken: string;
}
//#endregion

//#region SoundCloud user
export interface SoundCloudUserScheme {
	id: number;
	username: string;
	permalink_url: string;
	avatar_url: string;
}

export class SoundCloudUser extends Model {
	@Field(Number, "id")
	id: number;

	@Field(String, "username")
	username: string;

	@Field(String, "permalink_url")
	permalinkUrl: string;

	@Field(String, "avatar_url")
	avatarUrl: string;
}
//#endregion

//#region SoundCloud track
export interface SoundCloudTrackScheme {
	id: number;
	title: string;
	user: SoundCloudUserScheme;
	created_at: string;
	artwork_url: string | null;
	permalink_url: string;
	duration: number;
}

export class SoundCloudTrack extends Model {
	@Field(Number, "id")
	id: number;

	@Field(String, "title")
	title: string;

	@Field(SoundCloudUser, "user")
	user: SoundCloudUser;

	@Field(String, "created_at")
	createdAt: string;

	@Field(Nullable(String), "artwork_url")
	artworkUrl: string | null;

	@Field(String, "permalink_url")
	permalinkUrl: string;

	@Field(Number, "duration")
	duration: number;
}
//#endregion

//#region SoundCloud like event
export interface SoundCloudLikeEventScheme {
	created_at: string;
	id: number;
	title: string;
	user: SoundCloudUserScheme;
	artwork_url: string | null;
	permalink_url: string;
	duration: number;
}

export class SoundCloudLikeEvent extends Model {
	@Field(Date, "created_at")
	createdAt: Date;

	@Field(Number, "id")
	id: number;

	@Field(String, "title")
	title: string;

	@Field(SoundCloudUser, "user")
	user: SoundCloudUser;

	@Field(Nullable(String), "artwork_url")
	artworkUrl: string | null;

	@Field(String, "permalink_url")
	permalinkUrl: string;

	@Field(Number, "duration")
	duration: number;
}
//#endregion

//#region SoundCloud likes collection
export interface SoundCloudLikesCollectionScheme {
	collection: any[];
	next_href: string | null;
}

export class SoundCloudLikesCollection extends Model {
	@Field(ArrayOf(Any), "collection")
	items: any[];

	@Field(Nullable(String), "next_href")
	nextHref: string | null;
}
//#endregion
