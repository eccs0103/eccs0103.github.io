"use strict";

import "adaptive-extender/core";

//#region Spotify artist
interface SpotifyArtistScheme {
	name: string;
	external_urls: { spotify: string; };
}

export class SpotifyArtist {
	#name: string;
	#url: string;

	constructor(name: string, url: string) {
		this.#name = name;
		this.#url = url;
	}

	static import(source: any, name: string = "[source]"): SpotifyArtist {
		const object = Object.import(source, name);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const external_urls = Object.import(Reflect.get(object, "external_urls"), `${name}.external_urls`);
		const url = String.import(Reflect.get(external_urls, "spotify"), `${name}.external_urls.spotify`);
		return new SpotifyArtist($name, url);
	}

	get name(): string {
		return this.#name;
	}
}
//#endregion

//#region Spotify track
interface SpotifyTrackScheme {
	name: string;
	artists: SpotifyArtistScheme[];
	external_urls: { spotify: string; };
}

export class SpotifyTrack {
	#name: string;
	#artists: SpotifyArtist[];
	#url: string;

	constructor(name: string, artists: SpotifyArtist[], url: string) {
		this.#name = name;
		this.#artists = artists;
		this.#url = url;
	}

	static import(source: any, name: string = "[source]"): SpotifyTrack {
		const object = Object.import(source, name);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const external_urls = Object.import(Reflect.get(object, "external_urls"), `${name}.external_urls`);
		const url = String.import(Reflect.get(external_urls, "spotify"), `${name}.external_urls.spotify`);

		const artistsSource = Array.import(Reflect.get(object, "artists"), `${name}.artists`);
		const artists = artistsSource.map((item, index) => SpotifyArtist.import(item, `${name}.artists[${index}]`));

		return new SpotifyTrack($name, artists, url);
	}

	get name(): string {
		return this.#name;
	}

	get artists(): readonly SpotifyArtist[] {
		return this.#artists;
	}

	get url(): string {
		return this.#url;
	}
}
//#endregion

//#region Spotify saved track
/**
 * Сырое событие "лайка" из API
 */
export class SpotifySavedTrack {
	#addedAt: string;
	#track: SpotifyTrack;

	constructor(addedAt: string, track: SpotifyTrack) {
		this.#addedAt = addedAt;
		this.#track = track;
	}

	static import(source: any, name: string = "[source]"): SpotifySavedTrack {
		const object = Object.import(source, name);
		const addedAt = String.import(Reflect.get(object, "added_at"), `${name}.added_at`);
		const track = SpotifyTrack.import(Reflect.get(object, "track"), `${name}.track`);
		return new SpotifySavedTrack(addedAt, track);
	}

	get addedAt(): string {
		return this.#addedAt;
	}

	get track(): SpotifyTrack {
		return this.#track;
	}
}
//#endregion