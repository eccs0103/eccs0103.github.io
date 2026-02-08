"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Model, SetOf } from "adaptive-extender/core";

//#region Settings
export interface SettingsScheme {
	preferences: string[];
}

export class Settings extends Model {
	@Field(SetOf(String), "preferences")
	preferences: Set<string>;

	constructor();
	constructor(preferences: Set<string>);
	constructor(preferences?: Set<string>) {
		if (preferences === undefined) {
			super();
			return;
		}

		super();
		this.preferences = preferences;
	}
}
//#endregion
