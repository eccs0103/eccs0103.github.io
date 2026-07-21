"use strict";

import "adaptive-extender/core";
import { Field, Model, Nullable } from "adaptive-extender/core";

//#region Sensor
export interface SensorScheme {
	name: string;
	icon: string;
	webpage: string | null;
	note: string | null;
	status: string | null;
}

export class Sensor extends Model {
	@Field(String, { name: "name" })
	name: string;

	@Field(String, { name: "icon" })
	icon: string;

	@Field(Nullable.Of(String), { name: "webpage" })
	webpage: string | null;

	@Field(Nullable.Of(String), { name: "note" })
	note: string | null;

	@Field(Nullable.Of(String), { name: "status" })
	status: string | null;
}
//#endregion
//#region Sensor feed
export interface SensorFeedScheme {
	platforms: SensorScheme[];
}

export class SensorFeed extends Model {
	@Field(Array.Of(Sensor), { name: "platforms" })
	platforms: Sensor[];
}
//#endregion
