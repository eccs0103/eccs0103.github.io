"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Model, RecordOf } from "adaptive-extender/core";

//#region Old settings
/**
 * @deprecated
 */
export interface OldSettingsScheme {
	preferences: string[];
}

/**
 * @deprecated
 */
export class OldSettings extends Model {
	@Field(ArrayOf(String), "preferences")
	platforms: string[];

	constructor();
	constructor(platforms: string[]);
	constructor(platforms?: string[]) {
		if (platforms === undefined) {
			super();
			return;
		}

		super();
		this.platforms = platforms;
	}
}
//#endregion
//#region Settings
export interface SettingsScheme {
	preferences: Record<string, boolean>;
}

export class Settings extends Model {
	@Field(RecordOf(Boolean), "preferences")
	preferences: Map<string, boolean>;

	constructor();
	constructor(preferences: Map<string, boolean>);
	constructor(preferences?: Map<string, boolean>) {
		if (preferences === undefined) {
			super();
			return;
		}

		super();
		this.preferences = preferences;
	}
}
//#endregion
