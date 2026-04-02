"use strict";

import "adaptive-extender/core";
import { Field, Model, Optional } from "adaptive-extender/core";

//#region Device context
export class DeviceContext extends Model {
	/** CSS pixel width of the browser viewport at collection time. Changes when the user resizes the window. */
	@Field(Number, "viewport_width")
	viewportWidth: number;

	/** CSS pixel height of the browser viewport at collection time. */
	@Field(Number, "viewport_height")
	viewportHeight: number;

	/** Physical pixel width of the device's primary screen. Independent of window size. */
	@Field(Number, "screen_width")
	screenWidth: number;

	/** Physical pixel height of the device's primary screen. */
	@Field(Number, "screen_height")
	screenHeight: number;

	/** window.devicePixelRatio — ratio of physical to CSS pixels. 2.0 on Retina/HiDPI, 1.0 on standard displays, fractional on Windows with custom scaling. */
	@Field(Number, "pixel_ratio")
	pixelRatio: number;

	/** screen.colorDepth in bits per channel (typically 24 or 30). Lower values indicate HDR-limited or remote desktop sessions. */
	@Field(Number, "bit_depth")
	bitDepth: number;

	/** IANA timezone identifier resolved by Intl.DateTimeFormat (e.g. "Europe/Moscow"). Reflects the user's OS timezone, not the browser locale. */
	@Field(String, "timezone")
	timezone: string;

	/** true when the OS or browser is in dark color-scheme mode (prefers-color-scheme: dark). */
	@Field(Boolean, "dark_mode")
	darkMode: boolean;

	/** true when the user has requested reduced motion in accessibility settings (prefers-reduced-motion: reduce). */
	@Field(Boolean, "low_motion")
	lowMotion: boolean;

	/** true when high-contrast mode is active (prefers-contrast: more). Signals accessibility needs; rare on desktop, absent on most mobile devices. */
	@Field(Boolean, "high_contrast")
	highContrast: boolean;

	/** Pointer fidelity derived from media query. "fine" = mouse or trackpad, "coarse" = touchscreen, "none" = keyboard-only or TV remote. */
	@Field(String, "pointer_type")
	pointerType: string;

	/** navigator.hardwareConcurrency — logical CPU core count including hyperthreading. Approximates device tier. Firefox caps this at 2 to resist fingerprinting. */
	@Field(Number, "cpu_cores")
	cpuCores: number;

	/** navigator.maxTouchPoints — maximum simultaneous touch contacts supported. 0 on mouse-only desktops, ≥1 on any touch-capable device. */
	@Field(Number, "max_touch_points")
	maxTouchPoints: number;

	/** navigator.deviceMemory in GiB rounded to the nearest power of 2 (0.25–8). Absent in Firefox and Safari — undefined in those browsers. */
	@Field(Optional(Number), "memory_gigabytes")
	memoryGigabytes: number | undefined;

	/** navigator.onLine — false only when the browser is certain there is no network. Captive portals and metered connections may still report true. */
	@Field(Boolean, "online")
	online: boolean;

	/** navigator.cookieEnabled — false in strict private browsing modes or when cookies are blocked by browser policy. */
	@Field(Boolean, "cookies_enabled")
	cookiesEnabled: boolean;

	/** navigator.languages joined by comma (e.g. "en-US,ru,fr"). The first entry is the highest-priority user language. */
	@Field(String, "languages")
	languages: string;

	constructor();
	constructor(viewportWidth: number, viewportHeight: number, screenWidth: number, screenHeight: number, pixelRatio: number, bitDepth: number, timezone: string, darkMode: boolean, lowMotion: boolean, highContrast: boolean, pointerType: string, cpuCores: number, maxTouchPoints: number, memoryGigabytes: number | undefined, online: boolean, cookiesEnabled: boolean, languages: string);
	constructor(viewportWidth?: number, viewportHeight?: number, screenWidth?: number, screenHeight?: number, pixelRatio?: number, bitDepth?: number, timezone?: string, darkMode?: boolean, lowMotion?: boolean, highContrast?: boolean, pointerType?: string, cpuCores?: number, maxTouchPoints?: number, memoryGigabytes?: number, online?: boolean, cookiesEnabled?: boolean, languages?: string) {
		if (viewportWidth === undefined || viewportHeight === undefined || screenWidth === undefined || screenHeight === undefined || pixelRatio === undefined || bitDepth === undefined || timezone === undefined || darkMode === undefined || lowMotion === undefined || highContrast === undefined || pointerType === undefined || cpuCores === undefined || maxTouchPoints === undefined || online === undefined || cookiesEnabled === undefined || languages === undefined) {
			super();
			return;
		}

		super();
		this.viewportWidth = viewportWidth;
		this.viewportHeight = viewportHeight;
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.pixelRatio = pixelRatio;
		this.bitDepth = bitDepth;
		this.timezone = timezone;
		this.darkMode = darkMode;
		this.lowMotion = lowMotion;
		this.highContrast = highContrast;
		this.pointerType = pointerType;
		this.cpuCores = cpuCores;
		this.maxTouchPoints = maxTouchPoints;
		this.memoryGigabytes = memoryGigabytes;
		this.online = online;
		this.cookiesEnabled = cookiesEnabled;
		this.languages = languages;
	}
}
//#endregion
