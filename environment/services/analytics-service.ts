"use strict";

import "adaptive-extender/web";

import { BatteryCollector } from "./battery-collector.js";
import { BrowserCollector } from "./browser-collector.js";
import { DeviceCollector } from "./device-collector.js";
import { EngagementCollector } from "./engagement-collector.js";
import { ErrorCollector } from "./error-collector.js";
import { InteractionCollector } from "./interaction-collector.js";
import { NetworkCollector } from "./network-collector.js";
import { SessionCollector } from "./session-collector.js";
import { WebVitalsCollector } from "./web-vitals-collector.js";

//#region GTag
window.dataLayer ??= [];

window.gtag = function (): void {
	window.dataLayer.push(arguments);
};

//#endregion

//#region Events catalog
/**
 * All GA4 events emitted by this analytics service with their full parameter schemas.
 *
 * SETUP: Register the custom dimensions in GA4 → Admin → Custom definitions.
 * Every event carries `session_fingerprint` (per-tab UUID) and `user_fingerprint`
 * (persisted UUID in localStorage) — link all events from one user via these.
 *
 * ┌──────────────────────┬──────────────────────────────────────────────────────────────────┐
 * │ Event                │ Custom parameters sent                                           │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ device_context       │ viewport_width, viewport_height, screen_width, screen_height,    │
 * │                      │ pixel_ratio, bit_depth, timezone, dark_mode, low_motion,         │
 * │                      │ high_contrast, pointer_type, cpu_cores, max_touch_points,        │
 * │                      │ memory_gigabytes, online, cookies_enabled, languages             │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ browser_context      │ user_agent, platform, vendor, language, do_not_track,            │
 * │                      │ ua_brands, ua_mobile, ua_platform, ua_version,                   │
 * │                      │ ua_architecture, ua_device_model                                 │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ network_context      │ online, connection_type, effective_type, downlink,               │
 * │                      │ round_trip_time_milliseconds, save_data                          │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ battery_context      │ level, charging, charging_time, discharging_time                 │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ page_load            │ navigation_type, dom_interactive_milliseconds,                   │
 * │                      │ load_event_milliseconds, transfer_size                           │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ web_vital            │ vital_name (FCP/LCP/CLS/FID/INP/TTFB/LONG_TASKS), vital_value   │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ scroll_depth         │ scroll_percent (25 | 50 | 75 | 100)                             │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ page_leave           │ time_on_page, max_scroll_percent                                 │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ outbound_click       │ link_url, link_text                                              │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ text_copy            │ copy_text                                                        │
 * ├──────────────────────┼──────────────────────────────────────────────────────────────────┤
 * │ js_error             │ error_message, error_source, error_line                          │
 * └──────────────────────┴──────────────────────────────────────────────────────────────────┘
 *
 * GA4 user properties (set once per user via gtag "set"):
 *   cpu_cores | dark_mode | low_motion | pointer_type | memory_gigabytes
 */
//#endregion

//#region Analytics service
class AnalyticsService {
	static #lock: boolean = true;
	static #instance: AnalyticsService | null = null;

	#session: SessionCollector;

	constructor(id: string) {
		if (AnalyticsService.#lock) throw new TypeError("Illegal constructor");

		this.#session = new SessionCollector();

		window.gtag("js", new Date());
		window.gtag("config", id);
		window.gtag("set", { user_fingerprint: this.#session.userFingerprint, session_fingerprint: this.#session.sessionFingerprint });

		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
		document.head.appendChild(script);

		const emit = this.event.bind(this);
		new DeviceCollector(emit).collect();
		new BrowserCollector(emit).collect();
		new NetworkCollector(emit).collect();
		new BatteryCollector(emit).collect();
		new WebVitalsCollector(emit).collect();
		new EngagementCollector(emit).collect();
		new InteractionCollector(emit).collect();
		new ErrorCollector(emit).collect();
	}

	static get instance(): AnalyticsService {
		if (AnalyticsService.#instance === null) {
			AnalyticsService.#lock = false;
			AnalyticsService.#instance = new AnalyticsService("G-1N3MKL65T7");
			AnalyticsService.#lock = true;
		}
		return AnalyticsService.#instance;
	}

	event(name: string, params: object = {}): void {
		window.gtag("event", name, Object.assign({ session_fingerprint: this.#session.sessionFingerprint, user_fingerprint: this.#session.userFingerprint }, params));
	}
}

export const analytics = AnalyticsService.instance;
//#endregion
