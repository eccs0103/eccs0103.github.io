"use strict";

//#region G Tag
declare global {
	export interface Window {
		dataLayer: any[];
		gtag(...args: any[]): void;
	}

	interface LayoutShift extends PerformanceEntry {
		readonly value: number;
		readonly hadRecentInput: boolean;
	}
}

window.dataLayer ??= [];

window.gtag = function (): void {
	window.dataLayer.push(arguments);
};
//#endregion
//#region Analytics service
class AnalyticsService {
	static #lock: boolean = true;
	static #instance: AnalyticsService | null = null;

	constructor(id: string) {
		if (AnalyticsService.#lock) throw new TypeError("Illegal constructor");

		window.gtag("js", new Date());
		window.gtag("config", id);

		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
		document.head.appendChild(script);

		this.#trackWebVitals();
	}

	static get instance(): AnalyticsService {
		if (AnalyticsService.#instance === null) {
			AnalyticsService.#lock = false;
			AnalyticsService.#instance = new AnalyticsService("G-1N3MKL65T7");
			AnalyticsService.#lock = true;
		}
		return AnalyticsService.#instance;
	}

	event(name: string, params: Record<string, unknown> = {}): void {
		window.gtag("event", name, params);
	}

	#isLayoutShift(entry: PerformanceEntry): entry is LayoutShift {
		return "value" in entry && "hadRecentInput" in entry;
	}

	#trackWebVitals(): void {
		// FCP — fires once after first contentful paint
		const fcpObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (entry.name !== "first-contentful-paint") continue;
				this.event("web_vitals", { metric_name: "FCP", metric_value: Math.round(entry.startTime) });
			}
			fcpObserver.disconnect();
		});
		fcpObserver.observe({ type: "paint", buffered: true });

		// TTFB — available synchronously from Navigation Timing
		const navEntry = performance.getEntriesByType("navigation")[0];
		if (navEntry instanceof PerformanceNavigationTiming) {
			const ttfb = Math.round(navEntry.responseStart);
			if (ttfb > 0) this.event("web_vitals", { metric_name: "TTFB", metric_value: ttfb });
		}

		// LCP — browser may update the candidate multiple times; accumulate the latest
		let lcpValue = 0;
		const lcpObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!(entry instanceof LargestContentfulPaint)) continue;
				lcpValue = Math.round(entry.renderTime || entry.loadTime);
			}
		});
		lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

		// CLS — accumulate layout shifts that were not triggered by user input
		let clsValue = 0;
		const clsObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!this.#isLayoutShift(entry)) continue;
				if (entry.hadRecentInput) continue;
				clsValue += entry.value;
			}
		});
		clsObserver.observe({ type: "layout-shift", buffered: true });

		// Send accumulated LCP and CLS when the user leaves the page
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState !== "hidden") return;
			if (lcpValue > 0) this.event("web_vitals", { metric_name: "LCP", metric_value: lcpValue });
			this.event("web_vitals", { metric_name: "CLS", metric_value: Math.round(clsValue * 1000) });
			lcpObserver.disconnect();
			clsObserver.disconnect();
		}, { once: true });
	}
}

export const analytics = AnalyticsService.instance;
//#endregion
