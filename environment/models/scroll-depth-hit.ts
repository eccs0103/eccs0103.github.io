"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Scroll depth hit
export class ScrollDepthHit extends Model {
	/** Percentage milestone reached: 25, 50, 75, or 100. Fired exactly once per milestone per page load — milestones already passed are deleted from the tracking set so they are never re-reported on scroll-up. */
	@Field(Number, "scroll_percent")
	scrollPercent: number;

	constructor();
	constructor(scrollPercent: number);
	constructor(scrollPercent?: number) {
		if (scrollPercent === undefined) {
			super();
			return;
		}

		super();
		this.scrollPercent = scrollPercent;
	}
}
//#endregion
