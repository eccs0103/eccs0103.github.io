"use strict";

import "adaptive-extender/web";

import { PageLeave, ScrollDepthHit } from "../models/analytics.js";

export class EngagementCollector {
	#emit: (name: string, params: object) => void;
	#maxScrollPercent = 0;
	#totalVisibleMilliseconds = 0;
	#visibleSince: number | null;
	#milestones = new Set([25, 50, 75, 100]);

	constructor(emit: (name: string, params: object) => void) {
		this.#emit = emit;
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
		const scrollPercent = Math.min(Math.round((scrollY + innerHeight) / scrollHeight * 100), 100);
		if (scrollPercent > this.#maxScrollPercent) this.#maxScrollPercent = scrollPercent;
		for (const milestone of this.#milestones) {
			if (scrollPercent < milestone) continue;
			this.#milestones.delete(milestone);
			this.#emit("scroll_depth", ScrollDepthHit.export(new ScrollDepthHit(milestone)));
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
		this.#emit("page_leave", PageLeave.export(new PageLeave(Math.round(this.#totalVisibleMilliseconds / 1000), this.#maxScrollPercent)));
	}
}
