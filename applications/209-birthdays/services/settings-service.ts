"use strict";

import "adaptive-extender/web";
import { ArchiveRepository } from "adaptive-extender/web";
import { Settings } from "../models/settings.js";

//#region Settings service
class SettingsService {
	#repository: ArchiveRepository<typeof Settings>;

	constructor() {
		this.#repository = new ArchiveRepository(`Personal webpage\\Settings`, Settings);
	}

	loadSelection(): number {
		const repository = this.#repository;
		return repository.content.selection;
	}

	saveSelection(index: number): void {
		if (index < 0) return;
		const repository = this.#repository;
		repository.content.selection = index;
		repository.save(1000);
	}
}
//#endregion

export { SettingsService };
