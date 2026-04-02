"use strict";

import "adaptive-extender/web";
import { PageLoad } from "../models/page-load.js";
import { WebVital } from "../models/web-vital.js";
import { analytics } from "./analytics-service.js";
import { Controller } from "adaptive-extender/web";

const { round } = Math;

//#region Web vitals collector
declare global {
	export interface LayoutShiftEntry extends PerformanceEntry {
		value: number;
		hadRecentInput: boolean;
	}

	export interface PerformanceObserverInit {
		durationThreshold?: number;
	}
}

export class WebVitalsCollector extends Controller {
	async run(): Promise<void> {
		this.#trackFirstContentfulPaint();
		this.#trackNavigationTiming();
		this.#trackLargestContentfulPaint();
		this.#trackCumulativeLayoutShift();
		this.#trackFirstInputDelay();
		this.#trackInteractionToNextPaint();
		this.#trackLongTasks();
	}

	#isLayoutShift(entry: PerformanceEntry): entry is LayoutShiftEntry {
		return "value" in entry && "hadRecentInput" in entry;
	}

	#trackFirstContentfulPaint(): void {
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (entry.name !== "first-contentful-paint") continue;
				const fcp = round(entry.startTime);
				analytics.dispatch("web_vital", new WebVital("FCP", fcp));
			}
			observer.disconnect();
		});
		observer.observe({ type: "paint", buffered: true });
	}

	#trackNavigationTiming(): void {
		const [navEntry] = performance.getEntriesByType("navigation");
		if (!(navEntry instanceof PerformanceNavigationTiming)) return;
		const { responseStart, type, domInteractive, loadEventEnd, transferSize } = navEntry;
		const ttfb = round(responseStart);
		if (ttfb > 0) analytics.dispatch("web_vital", new WebVital("TTFB", ttfb));
		const domInteractiveMilliseconds = round(domInteractive);
		const loadEventMilliseconds = round(loadEventEnd);
		analytics.dispatch("page_load", new PageLoad(type, domInteractiveMilliseconds, loadEventMilliseconds, transferSize));
	}

	#trackLargestContentfulPaint(): void {
		let latest = 0;
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!(entry instanceof LargestContentfulPaint)) continue;
				latest = round(entry.renderTime || entry.loadTime);
			}
		});
		observer.observe({ type: "largest-contentful-paint", buffered: true });
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState !== "hidden") return;
			if (latest > 0) analytics.dispatch("web_vital", new WebVital("LCP", latest));
			observer.disconnect();
		}, { once: true });
	}

	#trackCumulativeLayoutShift(): void {
		let total = 0;
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!this.#isLayoutShift(entry)) continue;
				if (entry.hadRecentInput) continue;
				total += entry.value;
			}
		});
		observer.observe({ type: "layout-shift", buffered: true });
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState !== "hidden") return;
			const cls = round(total * 1000);
			analytics.dispatch("web_vital", new WebVital("CLS", cls));
			observer.disconnect();
		}, { once: true });
	}

	#trackFirstInputDelay(): void {
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!(entry instanceof PerformanceEventTiming)) continue;
				const fid = round(entry.processingStart - entry.startTime);
				analytics.dispatch("web_vital", new WebVital("FID", fid));
			}
			observer.disconnect();
		});
		observer.observe({ type: "first-input", buffered: true });
	}

	#trackInteractionToNextPaint(): void {
		let worst = 0;
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!(entry instanceof PerformanceEventTiming)) continue;
				if (entry.duration > worst) worst = round(entry.duration);
			}
		});
		observer.observe({ type: "event", buffered: true, durationThreshold: 40 });
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState !== "hidden") return;
			if (worst > 0) analytics.dispatch("web_vital", new WebVital("INP", worst));
			observer.disconnect();
		}, { once: true });
	}

	#trackLongTasks(): void {
		try {
			let count = 0;
			const observer = new PerformanceObserver((list) => {
				count += list.getEntries().length;
			});
			observer.observe({ type: "longtask", buffered: true });
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState !== "hidden") return;
				if (count > 0) analytics.dispatch("web_vital", new WebVital("LONG_TASKS", count));
				observer.disconnect();
			}, { once: true });
		} catch { /* longtask not supported in all browsers */ }
	}

	async catch(error: Error): Promise<void> {
		console.error(`Web vitals collection failed:\n${error}`);
	}
}
//#endregion
