"use strict";

import "adaptive-extender/core";

//#region Spotify token
export interface SpotifyTokenScheme {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
}

export class SpotifyToken {
	#accessToken: string;
	#tokenType: string;
	#expiresIn: number;
	#scope: string;

	constructor(accessToken: string, tokenType: string, expiresIn: number, scope: string) {
		this.#accessToken = accessToken;
		this.#tokenType = tokenType;
		this.#expiresIn = expiresIn;
		this.#scope = scope;
	}

	static import(source: any, name: string): SpotifyToken {
		const object = Object.import(source, name);
		const accessToken = String.import(Reflect.get(object, "access_token"), `${name}.access_token`);
		const tokenType = String.import(Reflect.get(object, "token_type"), `${name}.token_type`);
		const expiresIn = Number.import(Reflect.get(object, "expires_in"), `${name}.expires_in`);
		const scope = String.import(Reflect.get(object, "scope"), `${name}.scope`);
		const result = new SpotifyToken(accessToken, tokenType, expiresIn, scope);
		return result;
	}

	static export(source: SpotifyToken): SpotifyTokenScheme {
		const access_token = source.accessToken;
		const token_type = source.tokenType;
		const expires_in = source.expiresIn;
		const scope = source.scope;
		return { access_token, token_type, expires_in, scope };
	}

	get accessToken(): string {
		return this.#accessToken;
	}

	get tokenType(): string {
		return this.#tokenType;
	}

	get expiresIn(): number {
		return this.#expiresIn;
	}

	get scope(): string {
		return this.#scope;
	}
}
//#endregion

//#region Spotify external urls
export interface SpotifyExternalUrlsScheme {
	spotify: string;
}

export class SpotifyExternalUrls {
	#spotify: string;

	constructor(spotify: string) {
		this.#spotify = spotify;
	}

	static import(source: any, name: string): SpotifyExternalUrls {
		const object = Object.import(source, name);
		const spotify = String.import(Reflect.get(object, "spotify"), `${name}.spotify`);
		const result = new SpotifyExternalUrls(spotify);
		return result;
	}

	static export(source: SpotifyExternalUrls): SpotifyExternalUrlsScheme {
		const spotify = source.spotify;
		return { spotify };
	}

	get spotify(): string {
		return this.#spotify;
	}
}
//#endregion

//#region Spotify image
export interface SpotifyImageScheme {
	url: string;
	height: number | null;
	width: number | null;
}

export class SpotifyImage {
	#url: string;
	#height: number | null;
	#width: number | null;

	constructor(url: string, height: number | null, width: number | null) {
		this.#url = url;
		this.#height = height;
		this.#width = width;
	}

	static import(source: any, name: string): SpotifyImage {
		const object = Object.import(source, name);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const height = Reflect.mapNull<unknown, null, number>(Reflect.get(object, "height"), height => Number.import(height, `${name}.height`));
		const width = Reflect.mapNull<unknown, null, number>(Reflect.get(object, "width"), width => Number.import(width, `${name}.width`));
		const result = new SpotifyImage(url, height, width);
		return result;
	}

	static export(source: SpotifyImage): SpotifyImageScheme {
		const url = source.url;
		const height = source.height;
		const width = source.width;
		return { url, height, width };
	}

	get url(): string {
		return this.#url;
	}

	get height(): number | null {
		return this.#height;
	}

	get width(): number | null {
		return this.#width;
	}
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

export class SpotifyAlbum {
	#id: string;
	#name: string;
	#images: SpotifyImage[];
	#releaseDate: string;
	#externalUrls: SpotifyExternalUrls;

	constructor(id: string, name: string, images: SpotifyImage[], releaseDate: string, externalUrls: SpotifyExternalUrls) {
		this.#id = id;
		this.#name = name;
		this.#images = images;
		this.#releaseDate = releaseDate;
		this.#externalUrls = externalUrls;
	}

	static import(source: any, name: string): SpotifyAlbum {
		const object = Object.import(source, name);
		const id = String.import(Reflect.get(object, "id"), `${name}.id`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const images = Array.import(Reflect.get(object, "images"), `${name}.images`).map((item, index) => {
			return SpotifyImage.import(item, `${name}.images[${index}]`);
		});
		const releaseDate = String.import(Reflect.get(object, "release_date"), `${name}.release_date`);
		const externalUrls = SpotifyExternalUrls.import(Reflect.get(object, "external_urls"), `${name}.external_urls`);
		const result = new SpotifyAlbum(id, $name, images, releaseDate, externalUrls);
		return result;
	}

	static export(source: SpotifyAlbum): SpotifyAlbumScheme {
		const id = source.id;
		const name = source.name;
		const images = source.images.map(SpotifyImage.export);
		const release_date = source.releaseDate;
		const external_urls = SpotifyExternalUrls.export(source.externalUrls);
		return { id, name, images, release_date, external_urls };
	}

	get id(): string {
		return this.#id;
	}

	get name(): string {
		return this.#name;
	}

	get images(): SpotifyImage[] {
		return this.#images;
	}

	get releaseDate(): string {
		return this.#releaseDate;
	}

	get externalUrls(): SpotifyExternalUrls {
		return this.#externalUrls;
	}
}
//#endregion

//#region Spotify artist
export interface SpotifyArtistScheme {
	id: string;
	name: string;
	external_urls: SpotifyExternalUrlsScheme;
	uri: string;
}

export class SpotifyArtist {
	#id: string;
	#name: string;
	#externalUrls: SpotifyExternalUrls;
	#uri: string;

	constructor(id: string, name: string, externalUrls: SpotifyExternalUrls, uri: string) {
		this.#id = id;
		this.#name = name;
		this.#externalUrls = externalUrls;
		this.#uri = uri;
	}

	static import(source: any, name: string): SpotifyArtist {
		const object = Object.import(source, name);
		const id = String.import(Reflect.get(object, "id"), `${name}.id`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const externalUrls = SpotifyExternalUrls.import(Reflect.get(object, "external_urls"), `${name}.external_urls`);
		const uri = String.import(Reflect.get(object, "uri"), `${name}.uri`);
		const result = new SpotifyArtist(id, $name, externalUrls, uri);
		return result;
	}

	static export(source: SpotifyArtist): SpotifyArtistScheme {
		const id = source.id;
		const name = source.name;
		const external_urls = SpotifyExternalUrls.export(source.externalUrls);
		const uri = source.uri;
		return { id, name, external_urls, uri };
	}

	get id(): string {
		return this.#id;
	}

	get name(): string {
		return this.#name;
	}

	get externalUrls(): SpotifyExternalUrls {
		return this.#externalUrls;
	}

	get uri(): string {
		return this.#uri;
	}
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

export class SpotifyTrack {
	#id: string;
	#name: string;
	#artists: SpotifyArtist[];
	#album: SpotifyAlbum;
	#externalUrls: SpotifyExternalUrls;
	#durationMs: number;
	#previewUrl: string | null;
	#uri: string;

	constructor(id: string, name: string, artists: SpotifyArtist[], album: SpotifyAlbum, externalUrls: SpotifyExternalUrls, durationMs: number, previewUrl: string | null, uri: string) {
		this.#id = id;
		this.#name = name;
		this.#artists = artists;
		this.#album = album;
		this.#externalUrls = externalUrls;
		this.#durationMs = durationMs;
		this.#previewUrl = previewUrl;
		this.#uri = uri;
	}

	static import(source: any, name: string): SpotifyTrack {
		const object = Object.import(source, name);
		const id = String.import(Reflect.get(object, "id"), `${name}.id`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const artists = Array.import(Reflect.get(object, "artists"), `${name}.artists`).map((item, index) => {
			return SpotifyArtist.import(item, `${name}.artists[${index}]`);
		});
		const album = SpotifyAlbum.import(Reflect.get(object, "album"), `${name}.album`);
		const externalUrls = SpotifyExternalUrls.import(Reflect.get(object, "external_urls"), `${name}.external_urls`);
		const durationMs = Number.import(Reflect.get(object, "duration_ms"), `${name}.duration_ms`);
		const previewUrl = Reflect.mapNull<unknown, null, string>(Reflect.get(object, "preview_url"), previewUrl => String.import(previewUrl, `${name}.preview_url`));
		const uri = String.import(Reflect.get(object, "uri"), `${name}.uri`);
		const result = new SpotifyTrack(id, $name, artists, album, externalUrls, durationMs, previewUrl, uri);
		return result;
	}

	static export(source: SpotifyTrack): SpotifyTrackScheme {
		const id = source.id;
		const name = source.name;
		const artists = source.artists.map(SpotifyArtist.export);
		const album = SpotifyAlbum.export(source.album);
		const external_urls = SpotifyExternalUrls.export(source.externalUrls);
		const duration_ms = source.durationMs;
		const preview_url = source.previewUrl;
		const uri = source.uri;
		return { id, name, artists, album, external_urls, duration_ms, preview_url, uri };
	}

	get id(): string {
		return this.#id;
	}

	get name(): string {
		return this.#name;
	}

	get artists(): SpotifyArtist[] {
		return this.#artists;
	}

	get album(): SpotifyAlbum {
		return this.#album;
	}

	get externalUrls(): SpotifyExternalUrls {
		return this.#externalUrls;
	}

	get durationMs(): number {
		return this.#durationMs;
	}

	get previewUrl(): string | null {
		return this.#previewUrl;
	}

	get uri(): string {
		return this.#uri;
	}
}
//#endregion

//#region Spotify save event
export interface SpotifySaveEventScheme {
	added_at: string;
	track: SpotifyTrackScheme;
}

export class SpotifySaveEvent {
	#addedAt: string;
	#track: SpotifyTrack;

	constructor(addedAt: string, track: SpotifyTrack) {
		this.#addedAt = addedAt;
		this.#track = track;
	}

	static import(source: any, name: string): SpotifySaveEvent {
		const object = Object.import(source, name);
		const addedAt = String.import(Reflect.get(object, "added_at"), `${name}.added_at`);
		const track = SpotifyTrack.import(Reflect.get(object, "track"), `${name}.track`);
		const result = new SpotifySaveEvent(addedAt, track);
		return result;
	}

	static export(source: SpotifySaveEvent): SpotifySaveEventScheme {
		const added_at = source.addedAt;
		const track = SpotifyTrack.export(source.track);
		return { added_at, track };
	}

	get addedAt(): string {
		return this.#addedAt;
	}

	get track(): SpotifyTrack {
		return this.#track;
	}
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
	items: SpotifySaveEventScheme[];
}

export class SpotifySavesCollection {
	#href: string;
	#limit: number;
	#next: string | null;
	#offset: number;
	#previous: string | null;
	#total: number;
	#items: SpotifySaveEvent[];

	constructor(href: string, limit: number, next: string | null, offset: number, previous: string | null, total: number, items: SpotifySaveEvent[]) {
		this.#href = href;
		this.#limit = limit;
		this.#next = next;
		this.#offset = offset;
		this.#previous = previous;
		this.#total = total;
		this.#items = items;
	}

	static import(source: any, name: string): SpotifySavesCollection {
		const object = Object.import(source, name);
		const href = String.import(Reflect.get(object, "href"), `${name}.href`);
		const limit = Number.import(Reflect.get(object, "limit"), `${name}.limit`);
		const next = Reflect.mapNull<unknown, null, string>(Reflect.get(object, "next"), next => String.import(next, `${name}.next`));
		const offset = Number.import(Reflect.get(object, "offset"), `${name}.offset`);
		const previous = Reflect.mapNull<unknown, null, string>(Reflect.get(object, "previous"), previous => String.import(previous, `${name}.previous`));
		const total = Number.import(Reflect.get(object, "total"), `${name}.total`);
		const items = Array.import(Reflect.get(object, "items"), `${name}.items`).map((item, index) => {
			return SpotifySaveEvent.import(item, `${name}.items[${index}]`);
		});
		const result = new SpotifySavesCollection(href, limit, next, offset, previous, total, items);
		return result;
	}

	static export(source: SpotifySavesCollection): SpotifySavesCollectionScheme {
		const href = source.href;
		const limit = source.limit;
		const next = source.next;
		const offset = source.offset;
		const previous = source.previous;
		const total = source.total;
		const items = source.items.map(SpotifySaveEvent.export);
		return { href, limit, next, offset, previous, total, items };
	}

	get href(): string {
		return this.#href;
	}

	get limit(): number {
		return this.#limit;
	}

	get next(): string | null {
		return this.#next;
	}

	get offset(): number {
		return this.#offset;
	}

	get previous(): string | null {
		return this.#previous;
	}

	get total(): number {
		return this.#total;
	}

	get items(): SpotifySaveEvent[] {
		return this.#items;
	}
}
//#endregion
