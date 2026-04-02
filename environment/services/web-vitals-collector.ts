"use strict";

import "adaptive-extender/web";
import { PageLoad } from "../models/page-load.js";
import { WebVital } from "../models/web-vital.js";
import { Collector } from "./analytics-service.js";

const { round } = Math;

interface LayoutShiftEntry extends PerformanceEntry {
	value: number;
	hadRecentInput: boolean;
}

declare global {
	interface PerformanceObserverInit {
		durationThreshold?: number;
	}
}

//#region WebVitalsCollector
export class WebVitalsCollector extends Collector {
	async collect(): Promise<void> {
		this.#trackFirstContentfulPaint();
		this.#trackNavigationTiming();
		this.#trackLargestContentfulPaint();
		this.#trackCumulativeLayoutShift();
		this.#trackFirstInputDelay();
		this.#trackInteractionToNextPaint();
		this.#trackLongTasks();
	}

	#emitVital(name: string, value: number): void {
		this.dispatch("web_vital", new WebVital(name, value));
	}

	#isLayoutShift(entry: PerformanceEntry): entry is LayoutShiftEntry {
		return "value" in entry && "hadRecentInput" in entry;
	}

	#trackFirstContentfulPaint(): void {
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (entry.name !== "first-contentful-paint") continue;
				const fcp = round(entry.startTime);
				this.#emitVital("FCP", fcp);
			}
			observer.disconnect();
		});
		observer.observe({ type: "paint", buffered: true });
	}

	#trackNavigationTiming(): void {
		const navEntry = performance.getEntriesByType("navigation")[0];
		if (!(navEntry instanceof PerformanceNavigationTiming)) return;
		const ttfb = round(navEntry.responseStart);
		if (ttfb > 0) this.#emitVital("TTFB", ttfb);
		const navigationType = navEntry.type;
		const domInteractiveMilliseconds = round(navEntry.domInteractive);
		const loadEventMilliseconds = round(navEntry.loadEventEnd);
		const transferSize = navEntry.transferSize;
		this.dispatch("page_load", new PageLoad(navigationType, domInteractiveMilliseconds, loadEventMilliseconds, transferSize));
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
			if (latest > 0) this.#emitVital("LCP", latest);
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
			this.#emitVital("CLS", cls);
			observer.disconnect();
		}, { once: true });
	}

	#trackFirstInputDelay(): void {
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!(entry instanceof PerformanceEventTiming)) continue;
				const fid = round(entry.processingStart - entry.startTime);
				this.#emitVital("FID", fid);
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
			if (worst > 0) this.#emitVital("INP", worst);
			observer.disconnect();
		}, { once: true });
	}

	#trackLongTasks(): void {
		let count = 0;
		try {
			const observer = new PerformanceObserver((list) => { count += list.getEntries().length; });
			observer.observe({ type: "longtask", buffered: true });
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState !== "hidden") return;
				if (count > 0) this.#emitVital("LONG_TASKS", count);
				observer.disconnect();
			}, { once: true });
		} catch { /* longtask not supported in all browsers */ }
	}
}
//#endregion
