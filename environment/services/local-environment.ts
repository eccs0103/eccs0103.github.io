"use strict";

import { Environment } from "adaptive-extender/node";

//#region Local environment
class LocalEnvironment {
	static #lock: boolean = true;
	static #instance: LocalEnvironment | null = null;
	#host: string;
	#origin: Date;
	#githubToken: string;
	#githubUsername: string;
	#spotifyClientId: string;
	#spotifyClientSecret: string;
	#spotifyToken: string;

	constructor() {
		if (LocalEnvironment.#lock) throw new TypeError("Illegal constructor");
		const { env } = Environment;
		const name = typename(env);
		this.#host = env.hasValue("HOST") ? String.import(env.readValue("HOST"), `${name}.HOST`) : "localhost";
		this.#origin = new Date(String.import(env.readValue("ORIGIN"), `${name}.ORIGIN`));
		this.#githubUsername = String.import(env.readValue("GITHUB_USERNAME"), `${name}.GITHUB_USERNAME`);
		this.#githubToken = String.import(env.readValue("GITHUB_TOKEN"), `${name}.GITHUB_TOKEN`);
		this.#spotifyClientId = String.import(env.readValue("SPOTIFY_CLIENT_ID"), `${name}.SPOTIFY_CLIENT_ID`);
		this.#spotifyClientSecret = String.import(env.readValue("SPOTIFY_CLIENT_SECRET"), `${name}.SPOTIFY_CLIENT_SECRET`);
		this.#spotifyToken = String.import(env.readValue("SPOTIFY_TOKEN"), `${name}.SPOTIFY_TOKEN`);
	}

	static get env(): LocalEnvironment {
		if (LocalEnvironment.#instance === null) {
			LocalEnvironment.#lock = false;
			LocalEnvironment.#instance = new LocalEnvironment();
			LocalEnvironment.#lock = true;
		}
		return LocalEnvironment.#instance;
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
}

export const env = LocalEnvironment.env;
//#endregion
