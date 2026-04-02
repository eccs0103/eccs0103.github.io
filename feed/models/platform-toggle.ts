"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Platform toggle
export class PlatformToggle extends Model {
	/** Display name of the platform whose visibility was toggled (e.g. "GitHub", "Spotify"). */
	@Field(String, "platform_name")
	platformName: string;

	/** true when the platform was enabled; false when hidden. */
	@Field(Boolean, "enabled")
	enabled: boolean;

	constructor();
	constructor(platformName: string, enabled: boolean);
	constructor(platformName?: string, enabled?: boolean) {
		if (platformName === undefined || enabled === undefined) {
			super();
			return;
		}

		super();
		this.platformName = platformName;
		this.enabled = enabled;
	}
}
//#endregion
