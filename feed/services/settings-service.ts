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
			const recovered = new Map(platforms.map(preference => [preference, true]));
			localStorage.removeItem("Personal webpage\\Feed\\Settings");
			this.#repository = new ArchiveRepository("Personal webpage\\Feed\\Settings", Settings, new Settings(recovered));
		}

		const stored = this.#repository.content.preferences;
		const unsaved = [...preferences.keys()].filter(name => stored.add(name, true));
		if (unsaved.length === 0) return;
		void this.#repository.save();
	}

	readPreferences(): Map<string, boolean> {
		return this.#repository.content.preferences;
	}

	save(): Promise<void>;
	save(delay: number): Promise<void>;
	save(delay: number = 0): Promise<void> {
		return this.#repository.save(delay);
	}
}
//#endregion
