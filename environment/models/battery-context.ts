"use strict";

import "adaptive-extender/core";
import { Field, Model, Optional } from "adaptive-extender/core";

//#region Battery context
export class BatteryContext extends Model {
	/** Battery charge level from 0.0 to 1.0 (e.g. 0.75 = 75%). Always a float; multiply by 100 in GA4 to display as a percentage. */
	@Field(Number, "level")
	level: number;

	/** true when the device is currently plugged in and the battery is gaining charge. */
	@Field(Boolean, "charging")
	charging: boolean;

	/** Estimated seconds until fully charged. Infinity when not plugged in — stored as undefined to avoid polluting the event with a sentinel value. */
	@Field(Optional(Number), "charging_time")
	chargingTime: number | undefined;

	/** Estimated seconds until the battery is depleted. Infinity when plugged in or when the estimate is unavailable — stored as undefined for the same reason. */
	@Field(Optional(Number), "discharging_time")
	dischargingTime: number | undefined;

	constructor();
	constructor(level: number, charging: boolean, chargingTime: number | undefined, dischargingTime: number | undefined);
	constructor(level?: number, charging?: boolean, chargingTime?: number, dischargingTime?: number) {
		if (level === undefined || charging === undefined) {
			super();
			return;
		}

		super();
		this.level = level;
		this.charging = charging;
		this.chargingTime = chargingTime;
		this.dischargingTime = dischargingTime;
	}
}
//#endregion
