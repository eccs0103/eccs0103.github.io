"use strict";

import "adaptive-extender/core";
import { Field, Model, Nullable } from "adaptive-extender/core";

//#region Dashboard configuration
export interface DashboardConfigurationScheme {
	callsign: string;
	intro: string;
	launched: string | null;
}

export class DashboardConfiguration extends Model {
	@Field(String, { name: "callsign" })
	callsign: string;

	@Field(String, { name: "intro" })
	intro: string;

	@Field(Nullable.Of(Date), { name: "launched" })
	launched: Date | null;
}
//#endregion
