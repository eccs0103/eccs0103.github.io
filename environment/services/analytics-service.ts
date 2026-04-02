"use strict";

import "adaptive-extender/web";

import { Field, Model, Optional } from "adaptive-extender/core";

//#region GTag
declare global {
	export interface Window {
		dataLayer: any[];
		gtag(...args: any[]): void;
	}
}

window.dataLayer ??= [];

window.gtag = function (): void {
	window.dataLayer.push(arguments);
};
//#endregion

//#region Extension API declarations
declare global {
	interface LayoutShift extends PerformanceEntry {
		readonly value: number;
		readonly hadRecentInput: boolean;
	}

	interface BatteryManager extends EventTarget {
		readonly level: number;
		readonly charging: boolean;
		readonly chargingTime: number;
		readonly dischargingTime: number;
	}

	interface NetworkInformation extends EventTarget {
		readonly type?: string;
		readonly effectiveType?: string;
		readonly downlink?: number;
		readonly rtt?: number;
		readonly saveData?: boolean;
	}

	interface NavigatorUAData {
		readonly brands: ReadonlyArray<{ brand: string; version: string }>;
		readonly mobile: boolean;
		readonly platform: string;
		getHighEntropyValues(hints: ReadonlyArray<string>): Promise<UADataValues>;
	}

	interface UADataValues {
		readonly architecture?: string;
		readonly model?: string;
		readonly platformVersion?: string;
		readonly bitness?: string;
		readonly fullVersionList?: ReadonlyArray<{ brand: string; version: string }>;
	}

	interface Navigator {
		readonly getBattery?: () => Promise<BatteryManager>;
		readonly connection?: NetworkInformation;
		readonly deviceMemory?: number;
		readonly userAgentData?: NavigatorUAData;
	}

	interface PerformanceObserverInit {
		durationThreshold?: number;
	}
}
//#endregion

//#region Events catalog
/**
 * All GA4 events emitted by this analytics service with their full parameter schemas.
 *
 * SETUP: Register the custom dimensions below in GA4 → Admin → Custom definitions.
 * Every event also carries `session_fingerprint` (UUID, per tab) and `user_fingerprint`
 * (UUID persisted in localStorage) — use these to link all events from one user/session.
 *
 * ┌──────────────────────┬────────────────────────────────────────────────────────────┐
 * │ Event                │ Custom parameters sent                                     │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ device_context       │ viewport_width, viewport_height, screen_width,             │
 * │                      │ screen_height, dpr, bit_depth, timezone, dark_mode,        │
 * │                      │ low_motion, high_contrast, ptr_type, cpu_cores, max_taps,  │
 * │                      │ mem_gb, online, use_cookies, languages                     │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ browser_context      │ user_agent, platform, vendor, language, do_not_track,      │
 * │                      │ ua_brands, ua_mobile, ua_platform, ua_version,             │
 * │                      │ ua_arch, ua_model                                          │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ network_context      │ online, conn_type, eff_type, downlink, rtt_ms, save_data  │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ battery_context      │ level, charging, chrg_time, disc_time                     │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ page_load            │ nav_type, dom_time, load_time, xfer_size                  │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ web_vital            │ vit_name (FCP/LCP/CLS/FID/INP/TTFB/LONG_TASKS),          │
 * │                      │ vit_value                                                  │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ scroll_depth         │ pct_scroll (25 | 50 | 75 | 100)                           │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ page_leave           │ time_on_page, max_scroll                                   │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ outbound_click       │ link_url, link_text                                        │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ text_copy            │ copy_text                                                  │
 * ├──────────────────────┼────────────────────────────────────────────────────────────┤
 * │ js_error             │ err_msg, err_src, err_line                                 │
 * └──────────────────────┴────────────────────────────────────────────────────────────┘
 *
 * Global user properties (GA4 → User attributes, set once per user):
 *   cpu_cores | dark_mode | low_motion | ptr_type | mem_gb
 */
//#endregion

//#region Models
//#region Device context model
interface DeviceContextScheme {
	viewport_width: number;
	viewport_height: number;
	screen_width: number;
	screen_height: number;
	dpr: number;
	bit_depth: number;
	timezone: string;
	dark_mode: boolean;
	low_motion: boolean;
	high_contrast: boolean;
	ptr_type: string;
	cpu_cores: number;
	max_taps: number;
	mem_gb?: number;
	online: boolean;
	use_cookies: boolean;
	languages: string;
}

class DeviceContext extends Model {
	@Field(Number, "viewport_width") vpWidth: number;
	@Field(Number, "viewport_height") vpHeight: number;
	@Field(Number, "screen_width") scrWidth: number;
	@Field(Number, "screen_height") scrHeight: number;
	@Field(Number, "dpr") dpr: number;
	@Field(Number, "bit_depth") bitDepth: number;
	@Field(String, "timezone") timezone: string;
	@Field(Boolean, "dark_mode") darkMode: boolean;
	@Field(Boolean, "low_motion") lowMotion: boolean;
	@Field(Boolean, "high_contrast") highContrast: boolean;
	@Field(String, "ptr_type") ptrType: string;
	@Field(Number, "cpu_cores") cpuCores: number;
	@Field(Number, "max_taps") maxTaps: number;
	@Field(Optional(Number), "mem_gb") memGb: number | undefined;
	@Field(Boolean, "online") online: boolean;
	@Field(Boolean, "use_cookies") useCookies: boolean;
	@Field(String, "languages") languages: string;

	constructor();
	constructor(
		vpWidth: number, vpHeight: number,
		scrWidth: number, scrHeight: number,
		dpr: number, bitDepth: number,
		timezone: string, darkMode: boolean, lowMotion: boolean,
		highContrast: boolean, ptrType: string,
		cpuCores: number, maxTaps: number,
		memGb: number | undefined,
		online: boolean, useCookies: boolean, languages: string,
	);
	constructor(
		vpWidth?: number, vpHeight?: number,
		scrWidth?: number, scrHeight?: number,
		dpr?: number, bitDepth?: number,
		timezone?: string, darkMode?: boolean, lowMotion?: boolean,
		highContrast?: boolean, ptrType?: string,
		cpuCores?: number, maxTaps?: number,
		memGb?: number,
		online?: boolean, useCookies?: boolean, languages?: string,
	) {
		if (vpWidth === undefined || vpHeight === undefined || scrWidth === undefined || scrHeight === undefined
			|| dpr === undefined || bitDepth === undefined || timezone === undefined || darkMode === undefined
			|| lowMotion === undefined || highContrast === undefined || ptrType === undefined
			|| cpuCores === undefined || maxTaps === undefined || online === undefined
			|| useCookies === undefined || languages === undefined) {
			super();
			return;
		}
		super();
		this.vpWidth = vpWidth;
		this.vpHeight = vpHeight;
		this.scrWidth = scrWidth;
		this.scrHeight = scrHeight;
		this.dpr = dpr;
		this.bitDepth = bitDepth;
		this.timezone = timezone;
		this.darkMode = darkMode;
		this.lowMotion = lowMotion;
		this.highContrast = highContrast;
		this.ptrType = ptrType;
		this.cpuCores = cpuCores;
		this.maxTaps = maxTaps;
		this.memGb = memGb;
		this.online = online;
		this.useCookies = useCookies;
		this.languages = languages;
	}
}
//#endregion

//#region Browser context model
interface BrowserContextScheme {
	user_agent: string;
	platform: string;
	vendor: string;
	language: string;
	do_not_track?: string;
	ua_brands?: string;
	ua_mobile?: boolean;
	ua_platform?: string;
	ua_version?: string;
	ua_arch?: string;
	ua_model?: string;
}

class BrowserContext extends Model {
	@Field(String, "user_agent") userAgent: string;
	@Field(String, "platform") platform: string;
	@Field(String, "vendor") vendor: string;
	@Field(String, "language") language: string;
	@Field(Optional(String), "do_not_track") doNotTrack: string | undefined;
	@Field(Optional(String), "ua_brands") uaBrands: string | undefined;
	@Field(Optional(Boolean), "ua_mobile") uaMobile: boolean | undefined;
	@Field(Optional(String), "ua_platform") uaPlatform: string | undefined;
	@Field(Optional(String), "ua_version") uaVersion: string | undefined;
	@Field(Optional(String), "ua_arch") uaArch: string | undefined;
	@Field(Optional(String), "ua_model") uaModel: string | undefined;

	constructor();
	constructor(
		userAgent: string, platform: string, vendor: string, language: string,
		doNotTrack: string | undefined,
		uaBrands: string | undefined, uaMobile: boolean | undefined,
		uaPlatform: string | undefined, uaVersion: string | undefined,
		uaArch: string | undefined, uaModel: string | undefined,
	);
	constructor(
		userAgent?: string, platform?: string, vendor?: string, language?: string,
		doNotTrack?: string,
		uaBrands?: string, uaMobile?: boolean,
		uaPlatform?: string, uaVersion?: string,
		uaArch?: string, uaModel?: string,
	) {
		if (userAgent === undefined || platform === undefined || vendor === undefined || language === undefined) {
			super();
			return;
		}
		super();
		this.userAgent = userAgent;
		this.platform = platform;
		this.vendor = vendor;
		this.language = language;
		this.doNotTrack = doNotTrack;
		this.uaBrands = uaBrands;
		this.uaMobile = uaMobile;
		this.uaPlatform = uaPlatform;
		this.uaVersion = uaVersion;
		this.uaArch = uaArch;
		this.uaModel = uaModel;
	}
}
//#endregion

//#region Network context model
interface NetworkContextScheme {
	online: boolean;
	conn_type?: string;
	eff_type?: string;
	downlink?: number;
	rtt_ms?: number;
	save_data?: boolean;
}

class NetworkContext extends Model {
	@Field(Boolean, "online") online: boolean;
	@Field(Optional(String), "conn_type") connType: string | undefined;
	@Field(Optional(String), "eff_type") effType: string | undefined;
	@Field(Optional(Number), "downlink") downlink: number | undefined;
	@Field(Optional(Number), "rtt_ms") rttMs: number | undefined;
	@Field(Optional(Boolean), "save_data") saveData: boolean | undefined;

	constructor();
	constructor(
		online: boolean,
		connType: string | undefined, effType: string | undefined,
		downlink: number | undefined, rttMs: number | undefined,
		saveData: boolean | undefined,
	);
	constructor(
		online?: boolean,
		connType?: string, effType?: string,
		downlink?: number, rttMs?: number,
		saveData?: boolean,
	) {
		if (online === undefined) {
			super();
			return;
		}
		super();
		this.online = online;
		this.connType = connType;
		this.effType = effType;
		this.downlink = downlink;
		this.rttMs = rttMs;
		this.saveData = saveData;
	}
}
//#endregion

//#region Battery context model
interface BatteryContextScheme {
	level: number;
	charging: boolean;
	chrg_time?: number;
	disc_time?: number;
}

class BatteryContext extends Model {
	@Field(Number, "level") level: number;
	@Field(Boolean, "charging") charging: boolean;
	@Field(Optional(Number), "chrg_time") chrgTime: number | undefined;
	@Field(Optional(Number), "disc_time") discTime: number | undefined;

	constructor();
	constructor(level: number, charging: boolean, chrgTime: number | undefined, discTime: number | undefined);
	constructor(level?: number, charging?: boolean, chrgTime?: number, discTime?: number) {
		if (level === undefined || charging === undefined) {
			super();
			return;
		}
		super();
		this.level = level;
		this.charging = charging;
		this.chrgTime = chrgTime;
		this.discTime = discTime;
	}
}
//#endregion

//#region Page load model
interface PageLoadScheme {
	nav_type: string;
	dom_time: number;
	load_time: number;
	xfer_size: number;
}

class PageLoad extends Model {
	@Field(String, "nav_type") navType: string;
	@Field(Number, "dom_time") domTime: number;
	@Field(Number, "load_time") loadTime: number;
	@Field(Number, "xfer_size") xferSize: number;

	constructor();
	constructor(navType: string, domTime: number, loadTime: number, xferSize: number);
	constructor(navType?: string, domTime?: number, loadTime?: number, xferSize?: number) {
		if (navType === undefined || domTime === undefined || loadTime === undefined || xferSize === undefined) {
			super();
			return;
		}
		super();
		this.navType = navType;
		this.domTime = domTime;
		this.loadTime = loadTime;
		this.xferSize = xferSize;
	}
}
//#endregion

//#region Web vital model
interface WebVitalScheme {
	vit_name: string;
	vit_value: number;
}

class WebVital extends Model {
	@Field(String, "vit_name") vitName: string;
	@Field(Number, "vit_value") vitValue: number;

	constructor();
	constructor(vitName: string, vitValue: number);
	constructor(vitName?: string, vitValue?: number) {
		if (vitName === undefined || vitValue === undefined) {
			super();
			return;
		}
		super();
		this.vitName = vitName;
		this.vitValue = vitValue;
	}
}
//#endregion

//#region Engagement models
interface ScrollDepthHitScheme {
	pct_scroll: number;
}

class ScrollDepthHit extends Model {
	@Field(Number, "pct_scroll") pctScroll: number;

	constructor();
	constructor(pctScroll: number);
	constructor(pctScroll?: number) {
		if (pctScroll === undefined) {
			super();
			return;
		}
		super();
		this.pctScroll = pctScroll;
	}
}

interface PageLeaveScheme {
	time_on_page: number;
	max_scroll: number;
}

class PageLeave extends Model {
	@Field(Number, "time_on_page") timeOnPage: number;
	@Field(Number, "max_scroll") maxScroll: number;

	constructor();
	constructor(timeOnPage: number, maxScroll: number);
	constructor(timeOnPage?: number, maxScroll?: number) {
		if (timeOnPage === undefined || maxScroll === undefined) {
			super();
			return;
		}
		super();
		this.timeOnPage = timeOnPage;
		this.maxScroll = maxScroll;
	}
}
//#endregion

//#region Interaction models
interface OutboundClickScheme {
	link_url: string;
	link_text: string;
}

class OutboundClick extends Model {
	@Field(String, "link_url") linkUrl: string;
	@Field(String, "link_text") linkText: string;

	constructor();
	constructor(linkUrl: string, linkText: string);
	constructor(linkUrl?: string, linkText?: string) {
		if (linkUrl === undefined || linkText === undefined) {
			super();
			return;
		}
		super();
		this.linkUrl = linkUrl;
		this.linkText = linkText;
	}
}

interface TextCopyScheme {
	copy_text: string;
}

class TextCopy extends Model {
	@Field(String, "copy_text") text: string;

	constructor();
	constructor(text: string);
	constructor(text?: string) {
		if (text === undefined) {
			super();
			return;
		}
		super();
		this.text = text;
	}
}
//#endregion

//#region Error model
interface JsErrorScheme {
	err_msg: string;
	err_src?: string;
	err_line?: number;
}

class JsError extends Model {
	@Field(String, "err_msg") errMsg: string;
	@Field(Optional(String), "err_src") errSrc: string | undefined;
	@Field(Optional(Number), "err_line") errLine: number | undefined;

	constructor();
	constructor(errMsg: string, errSrc: string | undefined, errLine: number | undefined);
	constructor(errMsg?: string, errSrc?: string, errLine?: number) {
		if (errMsg === undefined) {
			super();
			return;
		}
		super();
		this.errMsg = errMsg;
		this.errSrc = errSrc;
		this.errLine = errLine;
	}
}
//#endregion

//#endregion

//#region Collector infrastructure
type EmitFn = (name: string, params: object) => void;
//#endregion

//#region Session collector
class SessionCollector {
	static readonly #userKey = "_uaf";
	static readonly #sessKey = "_saf";

	readonly userFingerprint: string;
	readonly sessFingerprint: string;

	constructor() {
		this.userFingerprint = SessionCollector.#loadKey(localStorage, SessionCollector.#userKey);
		this.sessFingerprint = SessionCollector.#loadKey(sessionStorage, SessionCollector.#sessKey);
	}

	static #loadKey(storage: Storage, key: string): string {
		const existing = storage.getItem(key);
		if (existing !== null) return existing;
		const fresh = crypto.randomUUID();
		storage.setItem(key, fresh);
		return fresh;
	}
}
//#endregion

//#region Collectors
//#region Device collector
class DeviceCollector {
	readonly #emit: EmitFn;

	constructor(emit: EmitFn) {
		this.#emit = emit;
	}

	collect(): void {
		const { navigator, screen, devicePixelRatio } = window;
		const ptrType = matchMedia("(pointer: fine)").matches ? "fine"
			: matchMedia("(pointer: coarse)").matches ? "coarse" : "none";

		const ctx = new DeviceContext(
			window.innerWidth, window.innerHeight,
			screen.width, screen.height,
			devicePixelRatio, screen.colorDepth,
			Intl.DateTimeFormat().resolvedOptions().timeZone,
			matchMedia("(prefers-color-scheme: dark)").matches,
			matchMedia("(prefers-reduced-motion: reduce)").matches,
			matchMedia("(prefers-contrast: more)").matches,
			ptrType,
			navigator.hardwareConcurrency,
			navigator.maxTouchPoints,
			navigator.deviceMemory,
			navigator.onLine,
			navigator.cookieEnabled,
			navigator.languages.join(","),
		);
		this.#emit("device_context", DeviceContext.export(ctx));

		window.gtag("set", "user_properties", {
			cpu_cores: navigator.hardwareConcurrency,
			dark_mode: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
			low_motion: matchMedia("(prefers-reduced-motion: reduce)").matches,
			ptr_type: ptrType,
			mem_gb: navigator.deviceMemory ?? null,
		});
	}
}
//#endregion

//#region Browser collector
class BrowserCollector {
	readonly #emit: EmitFn;

	constructor(emit: EmitFn) {
		this.#emit = emit;
	}

	collect(): void {
		void this.#init();
	}

	async #init(): Promise<void> {
		const { navigator } = window;
		let uaData: UADataValues | undefined;
		let uaBrands: string | undefined;
		let uaVersion: string | undefined;

		if (navigator.userAgentData) {
			try {
				uaData = await navigator.userAgentData.getHighEntropyValues([
					"architecture", "model", "platformVersion", "bitness", "fullVersionList",
				]);
				const brands = navigator.userAgentData.brands
					.filter(b => !b.brand.includes("Not"))
					.map(b => `${b.brand} ${b.version}`)
					.join(", ");
				uaBrands = brands || undefined;
				const fullList = uaData.fullVersionList
					?.filter(b => !b.brand.includes("Not"))
					.map(b => `${b.brand} ${b.version}`)
					.join(", ");
				uaVersion = fullList || undefined;
			} catch (reason) {
				console.error(`UA-CH collection failed:\n${Error.from(reason)}`);
			}
		}

		const ctx = new BrowserContext(
			navigator.userAgent,
			navigator.platform,
			navigator.vendor,
			navigator.language,
			navigator.doNotTrack ?? undefined,
			uaBrands,
			navigator.userAgentData?.mobile,
			navigator.userAgentData?.platform,
			uaVersion,
			uaData?.architecture,
			uaData?.model,
		);
		this.#emit("browser_context", BrowserContext.export(ctx));
	}
}
//#endregion

//#region Network collector
class NetworkCollector {
	readonly #emit: EmitFn;

	constructor(emit: EmitFn) {
		this.#emit = emit;
	}

	collect(): void {
		const { connection } = navigator;
		const ctx = new NetworkContext(
			navigator.onLine,
			connection?.type,
			connection?.effectiveType,
			connection?.downlink,
			connection?.rtt,
			connection?.saveData,
		);
		this.#emit("network_context", NetworkContext.export(ctx));
	}
}
//#endregion

//#region Battery collector
class BatteryCollector {
	readonly #emit: EmitFn;

	constructor(emit: EmitFn) {
		this.#emit = emit;
	}

	collect(): void {
		void this.#init();
	}

	async #init(): Promise<void> {
		if (!navigator.getBattery) return;
		try {
			const battery = await navigator.getBattery();
			this.#recBattery(battery);
			battery.addEventListener("levelchange", () => this.#recBattery(battery));
			battery.addEventListener("chargingchange", () => this.#recBattery(battery));
		} catch (reason) {
			console.error(`Battery API failed:\n${Error.from(reason)}`);
		}
	}

	#recBattery(battery: BatteryManager): void {
		const chrgTime = isFinite(battery.chargingTime) ? battery.chargingTime : undefined;
		const discTime = isFinite(battery.dischargingTime) ? battery.dischargingTime : undefined;
		this.#emit("battery_context", BatteryContext.export(new BatteryContext(battery.level, battery.charging, chrgTime, discTime)));
	}
}
//#endregion

//#region Web vitals collector
class WebVitalsCollector {
	readonly #emit: EmitFn;

	constructor(emit: EmitFn) {
		this.#emit = emit;
	}

	collect(): void {
		this.#recFCP();
		this.#recNavTiming();
		this.#recLCP();
		this.#recCLS();
		this.#recFID();
		this.#recINP();
		this.#recLongTasks();
	}

	#vital(name: string, value: number): void {
		this.#emit("web_vital", WebVital.export(new WebVital(name, value)));
	}

	#isLayoutShift(entry: PerformanceEntry): entry is LayoutShift {
		return "value" in entry && "hadRecentInput" in entry;
	}

	#recFCP(): void {
		const obs = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (entry.name !== "first-contentful-paint") continue;
				this.#vital("FCP", Math.round(entry.startTime));
			}
			obs.disconnect();
		});
		obs.observe({ type: "paint", buffered: true });
	}

	#recNavTiming(): void {
		const navEntry = performance.getEntriesByType("navigation")[0];
		if (!(navEntry instanceof PerformanceNavigationTiming)) return;

		const ttfb = Math.round(navEntry.responseStart);
		if (ttfb > 0) this.#vital("TTFB", ttfb);

		const load = new PageLoad(
			navEntry.type,
			Math.round(navEntry.domInteractive),
			Math.round(navEntry.loadEventEnd),
			navEntry.transferSize,
		);
		this.#emit("page_load", PageLoad.export(load));
	}

	#recLCP(): void {
		let latest = 0;
		const obs = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!(entry instanceof LargestContentfulPaint)) continue;
				latest = Math.round(entry.renderTime || entry.loadTime);
			}
		});
		obs.observe({ type: "largest-contentful-paint", buffered: true });
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState !== "hidden") return;
			if (latest > 0) this.#vital("LCP", latest);
			obs.disconnect();
		}, { once: true });
	}

	#recCLS(): void {
		let total = 0;
		const obs = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!this.#isLayoutShift(entry)) continue;
				if (entry.hadRecentInput) continue;
				total += entry.value;
			}
		});
		obs.observe({ type: "layout-shift", buffered: true });
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState !== "hidden") return;
			this.#vital("CLS", Math.round(total * 1000));
			obs.disconnect();
		}, { once: true });
	}

	#recFID(): void {
		const obs = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!(entry instanceof PerformanceEventTiming)) continue;
				this.#vital("FID", Math.round(entry.processingStart - entry.startTime));
			}
			obs.disconnect();
		});
		obs.observe({ type: "first-input", buffered: true });
	}

	#recINP(): void {
		let worst = 0;
		const obs = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!(entry instanceof PerformanceEventTiming)) continue;
				if (entry.duration > worst) worst = Math.round(entry.duration);
			}
		});
		obs.observe({ type: "event", buffered: true, durationThreshold: 40 });
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState !== "hidden") return;
			if (worst > 0) this.#vital("INP", worst);
			obs.disconnect();
		}, { once: true });
	}

	#recLongTasks(): void {
		let count = 0;
		try {
			const obs = new PerformanceObserver((list) => { count += list.getEntries().length; });
			obs.observe({ type: "longtask", buffered: true });
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState !== "hidden") return;
				if (count > 0) this.#vital("LONG_TASKS", count);
				obs.disconnect();
			}, { once: true });
		} catch { /* longtask not supported in all browsers */ }
	}
}
//#endregion

//#region Engagement collector
class EngagementCollector {
	readonly #emit: EmitFn;
	#maxScroll = 0;
	#totalMs = 0;
	#visibleSince: number | null;
	#milestones = new Set([25, 50, 75, 100]);

	constructor(emit: EmitFn) {
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
		const pct = Math.min(Math.round((scrollY + innerHeight) / scrollHeight * 100), 100);
		if (pct > this.#maxScroll) this.#maxScroll = pct;
		for (const milestone of this.#milestones) {
			if (pct < milestone) continue;
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
			this.#totalMs += Date.now() - this.#visibleSince;
			this.#visibleSince = null;
		}
		this.#emit("page_leave", PageLeave.export(new PageLeave(Math.round(this.#totalMs / 1000), this.#maxScroll)));
	}
}
//#endregion

//#region Interaction collector
class InteractionCollector {
	readonly #emit: EmitFn;

	constructor(emit: EmitFn) {
		this.#emit = emit;
	}

	collect(): void {
		document.addEventListener("click", this.#onClick.bind(this));
		document.addEventListener("copy", this.#onCopy.bind(this));
	}

	#onClick(event: MouseEvent): void {
		const anchor = event.composedPath().find((el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement);
		if (anchor === undefined) return;
		if (!anchor.href || anchor.target !== "_blank") return;
		this.#emit("outbound_click", OutboundClick.export(new OutboundClick(anchor.href, anchor.textContent?.trim() ?? "")));
	}

	#onCopy(): void {
		const text = window.getSelection()?.toString().trim();
		if (!text) return;
		this.#emit("text_copy", TextCopy.export(new TextCopy(text)));
	}
}
//#endregion

//#region Error collector
class ErrorCollector {
	readonly #emit: EmitFn;

	constructor(emit: EmitFn) {
		this.#emit = emit;
	}

	collect(): void {
		window.addEventListener("error", this.#onError.bind(this));
		window.addEventListener("unhandledrejection", this.#onReject.bind(this));
	}

	#onError(event: ErrorEvent): void {
		this.#emit("js_error", JsError.export(new JsError(event.message, event.filename || undefined, event.lineno || undefined)));
	}

	#onReject(event: PromiseRejectionEvent): void {
		this.#emit("js_error", JsError.export(new JsError(Error.from(event.reason).message, undefined, undefined)));
	}
}
//#endregion

//#endregion

//#region Analytics service
class AnalyticsService {
	static #lock: boolean = true;
	static #instance: AnalyticsService | null = null;

	readonly #session: SessionCollector;

	constructor(id: string) {
		if (AnalyticsService.#lock) throw new TypeError("Illegal constructor");

		this.#session = new SessionCollector();

		window.gtag("js", new Date());
		window.gtag("config", id);
		window.gtag("set", {
			user_fingerprint: this.#session.userFingerprint,
			session_fingerprint: this.#session.sessFingerprint,
		});

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
		window.gtag("event", name, Object.assign({
			session_fingerprint: this.#session.sessFingerprint,
			user_fingerprint: this.#session.userFingerprint,
		}, params));
	}
}

export const analytics = AnalyticsService.instance;
//#endregion
