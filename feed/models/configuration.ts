"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Model, Nullable } from "adaptive-extender/core";

//#region Platform
export interface PlatformScheme {
	name: string;
	icon: string;
	webpage: string | null;
	note: string | null;
	status: string | null;
}

export class Platform extends Model {
	@Field(String, "name")
	name: string;

	@Field(String, "icon")
	icon: string;

	@Field(Nullable(String), "webpage")
	webpage: string | null;

	@Field(Nullable(String), "note")
	note: string | null;

	@Field(Nullable(String), "status")
	status: string | null;
}
//#endregion
//#region Configuration
export interface ConfigurationScheme {
	platforms: PlatformScheme[];
	intro: string;
	outro: string;
}

export class Configuration extends Model {
	@Field(ArrayOf(Platform), "platforms")
	platforms: Platform[];

	@Field(String, "intro")
	intro: string;

	@Field(String, "outro")
	outro: string;
}
//#endregion
