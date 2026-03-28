"use strict";

import "adaptive-extender/web";
import { ArchiveRepository } from "adaptive-extender/web";
import { OldSettings, Settings } from "../models/settings.js";

//#region Settings service
export class SettingsService {
	#repository: ArchiveRepository<typeof Settings>;

	constructor(preferences: Map<string, boolean>) {
		try {
			this.#repository = new ArchiveRepository("Personal webpage\\Feed\\Settings", Settings, new Settings(preferences));
		} catch (reason) {
			if (!(reason instanceof SyntaxError)) throw reason;
			const { platforms } = new ArchiveRepository("Personal webpage\\Feed\\Settings", OldSettings, new OldSettings([])).content;
			const preferences = new Map(platforms.map(preference => [preference, true]));
			localStorage.removeItem("Personal webpage\\Feed\\Settings");
			this.#repository = new ArchiveRepository("Personal webpage\\Feed\\Settings", Settings, new Settings(preferences));
		}
	}

	readPreferences(): Map<string, boolean> {
		return this.#repository.content.preferences;
	}

	save(): void;
	save(delay: number): void;
	save(delay: number = 0): void {
		this.#repository.save(delay);
	}
}
//#endregion
