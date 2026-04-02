"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Page load
export class PageLoad extends Model {
	/** PerformanceNavigationTiming.type — how the current document was reached: "navigate" (fresh load), "reload", "back_forward" (browser history), or "prerender". */
	@Field(String, "navigation_type")
	navigationType: string;

	/** PerformanceNavigationTiming.domInteractive rounded to the nearest millisecond — when the HTML parser finished and the document entered interactive state. Scripts marked defer may still be executing at this point. */
	@Field(Number, "dom_interactive_milliseconds")
	domInteractiveMilliseconds: number;

	/** PerformanceNavigationTiming.loadEventEnd rounded to the nearest millisecond — when the load event handler completed. The classic "page load time" metric; includes all blocking resources. */
	@Field(Number, "load_event_milliseconds")
	loadEventMilliseconds: number;

	/** PerformanceNavigationTiming.transferSize in bytes — total wire size of the document response including headers. 0 for full cache hits (no network transfer); partial for 304 responses. */
	@Field(Number, "transfer_size")
	transferSize: number;

	constructor();
	constructor(navigationType: string, domInteractiveMilliseconds: number, loadEventMilliseconds: number, transferSize: number);
	constructor(navigationType?: string, domInteractiveMilliseconds?: number, loadEventMilliseconds?: number, transferSize?: number) {
		if (navigationType === undefined || domInteractiveMilliseconds === undefined || loadEventMilliseconds === undefined || transferSize === undefined) {
			super();
			return;
		}

		super();
		this.navigationType = navigationType;
		this.domInteractiveMilliseconds = domInteractiveMilliseconds;
		this.loadEventMilliseconds = loadEventMilliseconds;
		this.transferSize = transferSize;
	}
}
//#endregion
