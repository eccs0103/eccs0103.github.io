"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Activity pulse
export interface ActivityPulseScheme {
	platform: string;
	timestamp: number;
}

export class ActivityPulse extends Model {
	@Field(String, { name: "platform" })
	platform: string;

	@Field(Date.AsTimestamp, { name: "timestamp" })
	timestamp: Date;
}
//#endregion
//#region Activity meta
export interface ActivityMetaScheme {
	length: number;
}

export class ActivityMeta extends Model {
	@Field(Number, { name: "length" })
	length: number;
}
//#endregion
