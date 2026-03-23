"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Model, Nullable } from "adaptive-extender/core";

//#region Changelog entry
export interface ChangelogEntryScheme {
	date: string;
	changes: string[];
}

export class ChangelogEntry extends Model {
	@Field(Date, "date")
	date: Date;

	@Field(ArrayOf(String), "changes")
	changes: string[];

	constructor();
	constructor(date: Date, changes: string[]);
	constructor(date?: Date, changes?: string[]) {
		if (date === undefined || changes === undefined) {
			super();
			return;
		}

		super();
		this.date = date;
		this.changes = changes;
	}

	isNotSeen(since: Date | null): boolean {
		if (since === null) return true;
		if (since < this.date) return true;
		return false;
	}
}
//#endregion

//#region Changelog state
export interface ChangelogStateScheme {
	last_seen: string | null;
}

export class ChangelogState extends Model {
	@Field(Nullable(Date), "last_seen")
	lastSeen: Date | null;

	constructor();
	constructor(lastSeen: Date | null);
	constructor(lastSeen?: Date | null) {
		if (lastSeen === undefined) {
			super();
			return;
		}
		super();
		this.lastSeen = lastSeen;
	}
}
//#endregion
