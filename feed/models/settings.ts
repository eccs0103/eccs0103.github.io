"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Model } from "adaptive-extender/core";

//#region Settings
export interface SettingsScheme {
	preferences: string[];
}

export class Settings extends Model {
	@Field(ArrayOf(String), "preferences")
	preferences: string[];

	constructor();
	constructor(preferences: string[]);
	constructor(preferences?: string[]) {
		if (preferences === undefined) {
			super();
			return;
		}

		super();
		this.preferences = preferences;
	}
}
//#endregion
