"use strict";

import { Environment } from "adaptive-extender/node";

//#region Local environment
class LocalEnvironment {
	static #lock: boolean = true;
	static #instance: LocalEnvironment | null = null;
	#githubToken: string;
	#githubUsername: string;
	#spotifyClientId: string;
	#spotifyClientSecret: string;
	#spotifyToken: string;

	constructor() {
		if (LocalEnvironment.#lock) throw new TypeError("Illegal constructor");
		const { env } = Environment;
		const name = typename(env);
		this.#githubToken = String.import(env.readValue("TOKEN_GITHUB"), `${name}.TOKEN_GITHUB`);
		this.#githubUsername = String.import(env.readValue("USERNAME_GITHUB"), `${name}.USERNAME_GITHUB`);
		this.#spotifyClientId = String.import(env.readValue("CLIENT_ID_SPOTIFY"), `${name}.CLIENT_ID_SPOTIFY`);
		this.#spotifyClientSecret = String.import(env.readValue("CLIENT_SECRET_SPOTIFY"), `${name}.CLIENT_SECRET_SPOTIFY`);
		this.#spotifyToken = String.import(env.readValue("TOKEN_SPOTIFY"), `${name}.TOKEN_SPOTIFY`);
	}

	static get env(): LocalEnvironment {
		if (LocalEnvironment.#instance === null) {
			LocalEnvironment.#lock = false;
			LocalEnvironment.#instance = new LocalEnvironment();
			LocalEnvironment.#lock = true;
		}
		return LocalEnvironment.#instance;
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
