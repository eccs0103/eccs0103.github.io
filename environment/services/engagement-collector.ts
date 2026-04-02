"use strict";

import "adaptive-extender/web";
import { PageLeave } from "../models/page-leave.js";
import { ScrollDepthHit } from "../models/scroll-depth-hit.js";
import { AnalyticsService, Collector } from "./analytics-service.js";

const { round, min } = Math;

//#region EngagementCollector
export class EngagementCollector extends Collector {
	#maxScrollPercent = 0;
	#totalVisibleMilliseconds = 0;
	#visibleSince: number | null;
	#milestones = new Set([25, 50, 75, 100]);

	constructor(analytics: AnalyticsService) {
		super(analytics);
		this.#visibleSince = document.visibilityState === "visible" ? Date.now() : null;
	}

	collect(): void {
		window.addEventListener("scroll", this.#onScroll.bind(this), { passive: true });
		document.addEventListener("visibilitychange", this.#onVisibility.bind(this));
	}

	#onScroll(): void {
		const { scrollY, innerHeight } = window;
		const { scrollHeight } = document.documentElement;
		if (scrollHeight <= innerHeight) return;
		const scrollPercent = min(round((scrollY + innerHeight) / scrollHeight * 100), 100);
		if (scrollPercent > this.#maxScrollPercent) this.#maxScrollPercent = scrollPercent;
		for (const milestone of this.#milestones) {
			if (scrollPercent < milestone) continue;
			this.#milestones.delete(milestone);
			this.dispatch("scroll_depth", new ScrollDepthHit(milestone));
		}
	}

	#onVisibility(): void {
		if (document.visibilityState !== "hidden") {
			this.#visibleSince = Date.now();
			return;
		}
		if (this.#visibleSince !== null) {
			this.#totalVisibleMilliseconds += Date.now() - this.#visibleSince;
			this.#visibleSince = null;
		}
		this.dispatch("page_leave", new PageLeave(round(this.#totalVisibleMilliseconds / 1000), this.#maxScrollPercent));
	}
}
//#endregion
