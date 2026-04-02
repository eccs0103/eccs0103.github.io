"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Web vital
export class WebVital extends Model {
	/** Metric identity key. One of: FCP (First Contentful Paint — ms), LCP (Largest Contentful Paint — ms), CLS (Cumulative Layout Shift scaled ×1000 to preserve precision as integer), FID (First Input Delay — ms), INP (Interaction to Next Paint — ms), TTFB (Time to First Byte — ms), LONG_TASKS (count of tasks blocking the main thread >50 ms). */
	@Field(String, "vital_name")
	vitalName: string;

	/** Numeric value of the metric. All timing metrics are in milliseconds (Math.round applied). CLS is multiplied by 1000 before rounding so that 0.153 becomes 153 — avoids losing the decimal in GA4's integer event parameters. LONG_TASKS is a raw count. */
	@Field(Number, "vital_value")
	vitalValue: number;

	constructor();
	constructor(vitalName: string, vitalValue: number);
	constructor(vitalName?: string, vitalValue?: number) {
		if (vitalName === undefined || vitalValue === undefined) {
			super();
			return;
		}

		super();
		this.vitalName = vitalName;
		this.vitalValue = vitalValue;
	}
}
//#endregion
