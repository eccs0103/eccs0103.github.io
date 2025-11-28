"use strict";

import { Environment } from "adaptive-extender/node";

//#region Local environment
class LocalEnvironment {
	static #lock: boolean = true;
	static #instance: LocalEnvironment | null = null;
	#tokenGitHub: string;
	#usernameGitHub: string;

	get tokenGitHub(): string {
		return this.#tokenGitHub;
	}

	get usernameGitHub(): string {
		return this.#usernameGitHub;
	}

	constructor() {
		if (LocalEnvironment.#lock) throw new TypeError("Illegal constructor");
		const { env } = Environment;
		const name = typename(env);
		this.#tokenGitHub = String.import(env.readValue("TOKEN_GITHUB"), `${name}.TOKEN_GITHUB`);
		this.#usernameGitHub = String.import(env.readValue("USERNAME_GITHUB"), `${name}.USERNAME_GITHUB`);
	}

	static get env(): LocalEnvironment {
		if (LocalEnvironment.#instance === null) {
			LocalEnvironment.#lock = false;
			LocalEnvironment.#instance = new LocalEnvironment();
			LocalEnvironment.#lock = true;
		}
		return LocalEnvironment.#instance;
	}
}

const { env } = LocalEnvironment;
//#endregion

export { env };
