"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Model } from "adaptive-extender/core";

//#region Platform
export interface PlatformScheme {
	name: string;
	icon: string;
	webpage: string;
	is_active: boolean;
}

export class Platform extends Model {
	@Field(String, "name")
	name: string;

	@Field(String, "icon")
	icon: string;

	@Field(String, "webpage")
	webpage: string;

	@Field(Boolean, "is_active")
	isActive: boolean;
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
