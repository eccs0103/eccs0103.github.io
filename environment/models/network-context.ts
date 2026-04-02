"use strict";

import "adaptive-extender/core";
import { Field, Model, Optional } from "adaptive-extender/core";

//#region Network context
export class NetworkContext extends Model {
	/** navigator.onLine — false only when the browser is certain there is no network. Captive portals and metered connections still report true. */
	@Field(Boolean, "online")
	online: boolean;

	/** NetworkInformation.type — physical connection category: "wifi", "cellular", "ethernet", "bluetooth", "wimax", "other", "none", or "unknown". Absent in Firefox and Safari. */
	@Field(Optional(String), "connection_type")
	connectionType: string | undefined;

	/** NetworkInformation.effectiveType — estimated quality bracket: "4g", "3g", "2g", or "slow-2g". Derived from RTT and downlink measurements; not the actual network generation. Chromium only. */
	@Field(Optional(String), "effective_type")
	effectiveType: string | undefined;

	/** NetworkInformation.downlink in Mbit/s rounded to 25 kbit/s granularity. Capped at 10 Mbit/s to limit fingerprinting. Absent in Firefox and Safari. */
	@Field(Optional(Number), "downlink")
	downlink: number | undefined;

	/** NetworkInformation.rtt — estimated round-trip time in milliseconds rounded to the nearest 25 ms. Absent in Firefox and Safari. */
	@Field(Optional(Number), "round_trip_time_milliseconds")
	roundTripTimeMilliseconds: number | undefined;

	/** NetworkInformation.saveData — true when the user has enabled "Lite mode" or data-saving in browser settings. Chromium only; absent in Safari and Firefox. */
	@Field(Optional(Boolean), "save_data")
	saveData: boolean | undefined;

	constructor();
	constructor(online: boolean, connectionType: string | undefined, effectiveType: string | undefined, downlink: number | undefined, roundTripTimeMilliseconds: number | undefined, saveData: boolean | undefined);
	constructor(online?: boolean, connectionType?: string, effectiveType?: string, downlink?: number, roundTripTimeMilliseconds?: number, saveData?: boolean) {
		if (online === undefined) {
			super();
			return;
		}

		super();
		this.online = online;
		this.connectionType = connectionType;
		this.effectiveType = effectiveType;
		this.downlink = downlink;
		this.roundTripTimeMilliseconds = roundTripTimeMilliseconds;
		this.saveData = saveData;
	}
}
//#endregion
