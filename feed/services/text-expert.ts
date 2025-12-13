"use strict";

import { Timespan } from "adaptive-extender/core";

//#region Text expert
export class TextExpert {
	static getPluralSuffix(count: number): string {
		if (count > 1) return "s";
		return "";
	}

	static formatTime(timestamp: Date): string {
		const span = Timespan.fromValue(Date.now() - timestamp.valueOf());
		if (span.days > 3) return timestamp.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
		if (span.days > 0) return `${span.days} day${TextExpert.getPluralSuffix(span.days)} ago`;
		if (span.hours > 0) return `${span.hours} hour${TextExpert.getPluralSuffix(span.hours)} ago`;
		if (span.minutes > 0) return `${span.minutes} min${TextExpert.getPluralSuffix(span.minutes)} ago`;
		return "Just now";
	}
}
//#endregion
