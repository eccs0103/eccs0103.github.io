"use strict";

import "adaptive-extender/web";
import { ArchiveRepository } from "adaptive-extender/web";
import { Settings } from "../models/settings.js";

//#region Settings service
export class SettingsService {
	#repository: ArchiveRepository<typeof Settings>;

	constructor();
	constructor(preferences: string[]);
	constructor(preferences?: string[]) {
		if (preferences === undefined) {
			this.#repository = new ArchiveRepository("Personal webpage\\Feed\\Settings", Settings, new Settings());
			return;
		}

		this.#repository = new ArchiveRepository("Personal webpage\\Feed\\Settings", Settings, new Settings(preferences));
	}

	readPreferences(): string[] {
		return this.#repository.content.preferences;
	}

	save(): void;
	save(delay: number): void;
	save(delay: number = 0): void {
		this.#repository.save(delay);
	}
}
//#endregion
