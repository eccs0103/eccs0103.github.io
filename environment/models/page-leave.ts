"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Page leave
export class PageLeave extends Model {
	/** Total seconds the tab was in the foreground (visible state). Accumulated across multiple visibility-change cycles — background time is excluded. Rounded to the nearest whole second. */
	@Field(Number, "time_on_page")
	timeOnPage: number;

	/** Maximum scroll depth reached during the entire visit as an integer percentage (0–100). Monotonically non-decreasing — scrolling back up does not lower this value. */
	@Field(Number, "max_scroll_percent")
	maxScrollPercent: number;

	constructor();
	constructor(timeOnPage: number, maxScrollPercent: number);
	constructor(timeOnPage?: number, maxScrollPercent?: number) {
		if (timeOnPage === undefined || maxScrollPercent === undefined) {
			super();
			return;
		}

		super();
		this.timeOnPage = timeOnPage;
		this.maxScrollPercent = maxScrollPercent;
	}
}
//#endregion
