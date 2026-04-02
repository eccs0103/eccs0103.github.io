"use strict";

import "adaptive-extender/web";
import { PageLeave } from "../models/page-leave.js";
import { ScrollDepthHit } from "../models/scroll-depth-hit.js";
import { analytics, Collector } from "./analytics-service.js";

const { round, min } = Math;

//#region Engagement collector
export class EngagementCollector extends Collector {
	#maxScrollPercent = 0;
	#totalVisibleMilliseconds = 0;
	#visibleSince: number | null = null;
	#milestones = new Set([25, 50, 75, 100]);

	async collect(): Promise<void> {
		if (document.visibilityState === "visible") this.#visibleSince = Date.now();
		window.addEventListener("scroll", this.#onScroll.bind(this), { passive: true });
		document.addEventListener("visibilitychange", this.#onVisibility.bind(this));
	}

	#onScroll(): void {
		const milestones = this.#milestones;
		const { scrollY, innerHeight } = window;
		const { scrollHeight } = document.documentElement;
		if (scrollHeight <= innerHeight) return;
		const scrollPercent = min(round((scrollY + innerHeight) / scrollHeight * 100), 100);
		if (scrollPercent > this.#maxScrollPercent) this.#maxScrollPercent = scrollPercent;
		for (const milestone of milestones) {
			if (scrollPercent < milestone) continue;
			milestones.delete(milestone);
			analytics.dispatch("scroll_depth", new ScrollDepthHit(milestone));
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
		const visibleSeconds = round(this.#totalVisibleMilliseconds / 1000);
		const maxScrollPercent = this.#maxScrollPercent;
		analytics.dispatch("page_leave", new PageLeave(visibleSeconds, maxScrollPercent));
	}
}
//#endregion
