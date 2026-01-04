"use strict";

import { Environment } from "adaptive-extender/node";

//#region Local environment
class LocalEnvironment {
	static #lock: boolean = true;
	static #instance: LocalEnvironment | null = null;
	#host: string;
	#specialDictionary: Map<string, string>;
	#origin: Date;
	#githubToken: string;
	#githubUsername: string;
	#spotifyClientId: string;
	#spotifyClientSecret: string;
	#spotifyToken: string;
	#pinterestClientId: string;
	#pinterestClientSecret: string;
	#pinterestToken: string;
	#steamId: string;
	#steamApiKey: string;

	constructor() {
		if (LocalEnvironment.#lock) throw new TypeError("Illegal constructor");
		const { env } = Environment;
		const name = typename(env);
		this.#host = env.hasValue("HOST") ? String.import(env.readValue("HOST"), `${name}.HOST`) : "localhost";
		const specificKeys = Array.import(env.readValue("SPECIFIC_KEYS"), `${name}.SPECIFIC_KEYS`).map((item, index) => {
			return String.import(item, `${name}.SPECIFIC_KEYS[${index}]`);
		});
		const specificValues = Array.import(env.readValue("SPECIFIC_VALUES"), `${name}.SPECIFIC_VALUES`).map((item, index) => {
			return String.import(item, `${name}.SPECIFIC_VALUES[${index}]`);
		});
		this.#specialDictionary = new Map(Array.zip(specificKeys, specificValues));
		this.#origin = new Date(String.import(env.readValue("ORIGIN"), `${name}.ORIGIN`));
		this.#githubUsername = String.import(env.readValue("GITHUB_USERNAME"), `${name}.GITHUB_USERNAME`);
		this.#githubToken = String.import(env.readValue("GITHUB_TOKEN"), `${name}.GITHUB_TOKEN`);
		this.#spotifyClientId = String.import(env.readValue("SPOTIFY_CLIENT_ID"), `${name}.SPOTIFY_CLIENT_ID`);
		this.#spotifyClientSecret = String.import(env.readValue("SPOTIFY_CLIENT_SECRET"), `${name}.SPOTIFY_CLIENT_SECRET`);
		this.#spotifyToken = String.import(env.readValue("SPOTIFY_TOKEN"), `${name}.SPOTIFY_TOKEN`);
		this.#pinterestClientId = String.import(env.readValue("PINTEREST_TOKEN"), `${name}.PINTEREST_TOKEN`);
		this.#pinterestClientSecret = String.import(env.readValue("PINTEREST_TOKEN"), `${name}.PINTEREST_TOKEN`);
		this.#pinterestToken = String.import(env.readValue("PINTEREST_TOKEN"), `${name}.PINTEREST_TOKEN`);
		this.#steamId = String.import(env.readValue("STEAM_ID"), `${name}.STEAM_ID`);
		this.#steamApiKey = String.import(env.readValue("STEAM_API_KEY"), `${name}.STEAM_API_KEY`);
	}

	static get env(): LocalEnvironment {
		if (LocalEnvironment.#instance === null) {
			LocalEnvironment.#lock = false;
			LocalEnvironment.#instance = new LocalEnvironment();
			LocalEnvironment.#lock = true;
		}
		return LocalEnvironment.#instance;
	}

	get specialDictionary(): Map<string, string> {
		return this.#specialDictionary;
	}

	get host(): string {
		return this.#host;
	}

	get origin(): Date {
		return this.#origin;
	}

	get githubToken(): string {
		return this.#githubToken;
	}

	get githubUsername(): string {
		return this.#githubUsername;
	}

	get spotifyClientId(): string {
		return this.#spotifyClientId;
	}

	get spotifyClientSecret(): string {
		return this.#spotifyClientSecret;
	}

	get spotifyToken(): string {
		return this.#spotifyToken;
	}

	get pinterestClientId(): string {
		return this.#pinterestClientId;
	}

	get pinterestClientSecret(): string {
		return this.#pinterestClientSecret;
	}

	get pinterestToken(): string {
		return this.#pinterestToken;
	}

	get steamId(): string {
		return this.#steamId;
	}

	get steamApiKey(): string {
		return this.#steamApiKey;
	}
}

export const env = LocalEnvironment.env;
//#endregion
