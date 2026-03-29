"use strict";

import "adaptive-extender/web";

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

		this.#trackSession();
		this.#trackWebVitals();
		this.#trackEngagement();
		this.#trackInteractions();
		this.#trackErrors();
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

		// TTFB + Navigation type + Page load timings — from the same Navigation entry
		const navEntry = performance.getEntriesByType("navigation")[0];
		if (navEntry instanceof PerformanceNavigationTiming) {
			const ttfb = Math.round(navEntry.responseStart);
			if (ttfb > 0) this.event("web_vitals", { metric_name: "TTFB", metric_value: ttfb });
			this.event("page_load", {
				nav_type: navEntry.type,
				dom_interactive_ms: Math.round(navEntry.domInteractive),
				load_event_ms: Math.round(navEntry.loadEventEnd),
				transfer_size_bytes: navEntry.transferSize,
			});
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

		// FID — delay before the browser can process the first user interaction
		const fidObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!(entry instanceof PerformanceEventTiming)) continue;
				const fid = Math.round(entry.processingStart - entry.startTime);
				this.event("web_vitals", { metric_name: "FID", metric_value: fid });
			}
			fidObserver.disconnect();
		});
		fidObserver.observe({ type: "first-input", buffered: true });

		// INP — worst interaction-to-paint delay; accumulate max
		let inpValue = 0;
		const inpObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!(entry instanceof PerformanceEventTiming)) continue;
				if (entry.duration > inpValue) inpValue = Math.round(entry.duration);
			}
		});
		inpObserver.observe({ type: "event", buffered: true });

		// Long Tasks — UI freezes over 50 ms
		let longTaskCount = 0;
		try {
			const ltObserver = new PerformanceObserver((list) => { longTaskCount += list.getEntries().length; });
			ltObserver.observe({ type: "longtask", buffered: true });
		} catch { /* not supported in all browsers */ }

		// Send accumulated metrics when the user leaves the page
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState !== "hidden") return;
			if (lcpValue > 0) this.event("web_vitals", { metric_name: "LCP", metric_value: lcpValue });
			this.event("web_vitals", { metric_name: "CLS", metric_value: Math.round(clsValue * 1000) });
			if (inpValue > 0) this.event("web_vitals", { metric_name: "INP", metric_value: inpValue });
			if (longTaskCount > 0) this.event("web_vitals", { metric_name: "LONG_TASK_COUNT", metric_value: longTaskCount });
			lcpObserver.disconnect();
			clsObserver.disconnect();
			inpObserver.disconnect();
		}, { once: true });
	}

	#trackSession(): void {
		const { navigator, screen, devicePixelRatio } = window;
		this.event("device_context", {
			viewport_width: window.innerWidth,
			viewport_height: window.innerHeight,
			pixel_ratio: devicePixelRatio,
			color_depth: screen.colorDepth,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			dark_mode: matchMedia("(prefers-color-scheme: dark)").matches,
			reduced_motion: matchMedia("(prefers-reduced-motion: reduce)").matches,
			cpu_cores: navigator.hardwareConcurrency,
			touch_points: navigator.maxTouchPoints,
			...(document.referrer && { referrer: document.referrer }),
		});
	}

	#trackEngagement(): void {
		let visibleSince: number | null = document.visibilityState === "visible" ? Date.now() : null;
		let totalTimeMs = 0;
		let maxScrollPct = 0;

		const milestones = new Set([25, 50, 75, 100]);

		window.addEventListener("scroll", () => {
			const { scrollY, innerHeight } = window;
			const { scrollHeight } = document.documentElement;
			if (scrollHeight <= innerHeight) return;
			const pct = Math.round((scrollY + innerHeight) / scrollHeight * 100);
			if (pct > maxScrollPct) maxScrollPct = Math.min(pct, 100);
			for (const milestone of milestones) {
				if (pct < milestone) continue;
				milestones.delete(milestone);
				this.event("scroll_depth", { depth_pct: milestone });
			}
		}, { passive: true });

		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "hidden") {
				if (visibleSince !== null) {
					totalTimeMs += Date.now() - visibleSince;
					visibleSince = null;
				}
				this.event("page_leave", {
					time_on_page_sec: Math.round(totalTimeMs / 1000),
					max_scroll_pct: maxScrollPct,
				});
				return;
			}
			visibleSince = Date.now();
		});
	}

	#trackInteractions(): void {
		document.addEventListener("click", (event) => {
			const anchor = event.composedPath().find((el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement);
			if (anchor === undefined) return;
			if (!anchor.href || anchor.target !== "_blank") return;
			this.event("outbound_link_click", {
				link_url: anchor.href,
				link_text: anchor.textContent.trim(),
			});
		});

		document.addEventListener("copy", () => {
			const text = window.getSelection()?.toString().trim();
			if (text === undefined) return;
			this.event("text_copy", { copied_text: text });
		});
	}

	#trackErrors(): void {
		window.addEventListener("error", (event) => {
			this.event("js_error", {
				error_message: event.message,
				error_source: event.filename,
				error_line: event.lineno,
			});
		});

		window.addEventListener("unhandledrejection", (event) => {
			this.event("js_error", { error_message: Error.from(event.reason).message });
		});
	}
}

export const analytics = AnalyticsService.instance;
//#endregion
