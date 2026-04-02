"use strict";

import "adaptive-extender/core";
import { Field, Model, Optional } from "adaptive-extender/core";

//#region User properties
export class UserProperties extends Model {
	/** Logical CPU core count. Approximates device performance tier. Firefox caps at 2 to resist fingerprinting. */
	@Field(Number, "cpu_cores")
	cpuCores: number;

	/** "dark" or "light" — resolved from prefers-color-scheme at collection time. */
	@Field(String, "dark_mode")
	darkMode: string;

	/** true when prefers-reduced-motion is active in OS accessibility settings. */
	@Field(Boolean, "low_motion")
	lowMotion: boolean;

	/** Primary pointer fidelity: "fine" (mouse/trackpad), "coarse" (touchscreen), or "none" (keyboard-only). */
	@Field(String, "pointer_type")
	pointerType: string;

	/** navigator.deviceMemory in GiB (power-of-2 bucket, 0.25–8). Absent in Firefox and Safari. */
	@Field(Optional(Number), "memory_gigabytes")
	memoryGigabytes: number | undefined;

	constructor();
	constructor(cpuCores: number, darkMode: string, lowMotion: boolean, pointerType: string, memoryGigabytes: number | undefined);
	constructor(cpuCores?: number, darkMode?: string, lowMotion?: boolean, pointerType?: string, memoryGigabytes?: number) {
		if (cpuCores === undefined || darkMode === undefined || lowMotion === undefined || pointerType === undefined) {
			super();
			return;
		}

		super();
		this.cpuCores = cpuCores;
		this.darkMode = darkMode;
		this.lowMotion = lowMotion;
		this.pointerType = pointerType;
		this.memoryGigabytes = memoryGigabytes;
	}
}
//#endregion
