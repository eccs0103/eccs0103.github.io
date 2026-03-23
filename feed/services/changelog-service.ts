"use strict";

import "adaptive-extender/web";
import { ArchiveRepository } from "adaptive-extender/web";
import { ChangelogEntry, ChangelogState } from "../models/changelog.js";

//#region Changelog service
export class ChangelogService {
	#repository: ArchiveRepository<typeof ChangelogState>;
	#entries: readonly ChangelogEntry[];

	constructor(entries: readonly ChangelogEntry[]) {
		this.#entries = [...entries].sort((first, second) => second.date.valueOf() - first.date.valueOf());
		this.#repository = new ArchiveRepository("Personal webpage\\Feed\\Changelog", ChangelogState, new ChangelogState(null));
	}

	get isFirstVisit(): boolean {
		return this.#repository.content.lastSeen === null;
	}

	get unseen(): readonly ChangelogEntry[] {
		const { lastSeen } = this.#repository.content;
		return this.#entries.filter(entry => entry.isNotSeen(lastSeen));
	}

	markAsSeen(): void {
		const repository = this.#repository;
		const latest = this.#entries.at(0);
		if (latest === undefined) return;
		repository.content.lastSeen = latest.date;
		// repository.save();
	}
}
//#endregion
