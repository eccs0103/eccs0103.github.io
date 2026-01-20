"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Nullable, Model, Any } from "adaptive-extender/core";

//#region Spotify token
export interface SpotifyTokenScheme {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
}

export class SpotifyToken extends Model {
	@Field(String, "access_token")
	accessToken: string;

	@Field(String, "token_type")
	tokenType: string;

	@Field(Number, "expires_in")
	expiresIn: number;

	@Field(String, "scope")
	scope: string;
}
//#endregion

//#region Spotify external urls
export interface SpotifyExternalUrlsScheme {
	spotify: string;
}

export class SpotifyExternalUrls extends Model {
	@Field(String, "spotify")
	spotify: string;
}
//#endregion

//#region Spotify image
export interface SpotifyImageScheme {
	url: string;
	height: number | null;
	width: number | null;
}

export class SpotifyImage extends Model {
	@Field(String, "url")
	url: string;

	@Field(Nullable(Number), "height")
	height: number | null;

	@Field(Nullable(Number), "width")
	width: number | null;
}
//#endregion

//#region Spotify album
export interface SpotifyAlbumScheme {
	id: string;
	name: string;
	images: SpotifyImageScheme[];
	release_date: string;
	external_urls: SpotifyExternalUrlsScheme;
}

export class SpotifyAlbum extends Model {
	@Field(String, "id")
	id: string;

	@Field(String, "name")
	name: string;

	@Field(ArrayOf(SpotifyImage), "images")
	images: SpotifyImage[];

	@Field(String, "release_date")
	releaseDate: string;

	@Field(SpotifyExternalUrls, "external_urls")
	externalUrls: SpotifyExternalUrls;
}
//#endregion

//#region Spotify artist
export interface SpotifyArtistScheme {
	id: string;
	name: string;
	external_urls: SpotifyExternalUrlsScheme;
	uri: string;
}

export class SpotifyArtist extends Model {
	@Field(String, "id")
	id: string;

	@Field(String, "name")
	name: string;

	@Field(SpotifyExternalUrls, "external_urls")
	externalUrls: SpotifyExternalUrls;

	@Field(String, "uri")
	uri: string;
}
//#endregion

//#region Spotify track
export interface SpotifyTrackScheme {
	id: string;
	name: string;
	artists: SpotifyArtistScheme[];
	album: SpotifyAlbumScheme;
	external_urls: SpotifyExternalUrlsScheme;
	duration_ms: number;
	preview_url: string | null;
	uri: string;
}

export class SpotifyTrack extends Model {
	@Field(String, "id")
	id: string;

	@Field(String, "name")
	name: string;

	@Field(ArrayOf(SpotifyArtist), "artists")
	artists: SpotifyArtist[];

	@Field(SpotifyAlbum, "album")
	album: SpotifyAlbum;

	@Field(SpotifyExternalUrls, "external_urls")
	externalUrls: SpotifyExternalUrls;

	@Field(Number, "duration_ms")
	durationMs: number;

	@Field(Nullable(String), "preview_url")
	previewUrl: string | null;

	@Field(String, "uri")
	uri: string;
}
//#endregion

//#region Spotify save event
export interface SpotifySaveEventScheme {
	added_at: string;
	track: SpotifyTrackScheme;
}

export class SpotifySaveEvent extends Model {
	@Field(Date, "added_at")
	addedAt: Date;

	@Field(SpotifyTrack, "track")
	track: SpotifyTrack;
}
//#endregion

//#region Spotify saves collection
export interface SpotifySavesCollectionScheme {
	href: string;
	limit: number;
	next: string | null;
	offset: number;
	previous: string | null;
	total: number;
	items: any[];
}

export class SpotifySavesCollection extends Model {
	@Field(String, "href")
	href: string;

	@Field(Number, "limit")
	limit: number;

	@Field(Nullable(String), "next")
	next: string | null;

	@Field(Number, "offset")
	offset: number;

	@Field(Nullable(String), "previous")
	previous: string | null;

	@Field(Number, "total")
	total: number;

	@Field(ArrayOf(Any), "items")
	items: any[];
}
//#endregion
