"use strict";

import "adaptive-extender/web";
import { DeviceContext } from "../models/device-context.js";
import { UserProperties } from "../models/user-properties.js";
import { analytics, Collector } from "./analytics-service.js";

//#region Device collector
declare global {
	export interface Navigator {
		deviceMemory?: number;
	}
}

export class DeviceCollector extends Collector {
	async collect(): Promise<void> {
		try {
			this.#dispatch();
		} catch (reason) {
			console.error(`Device collection failed:\n${Error.from(reason)}`);
		}
	}

	#dispatch(): void {
		const { innerWidth, innerHeight } = window;
		const screenWidth = screen.width;
		const screenHeight = screen.height;
		const pixelRatio = devicePixelRatio;
		const colorDepth = screen.colorDepth;
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const darkMode = matchMedia("(prefers-color-scheme: dark)").matches;
		const lowMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const highContrast = matchMedia("(prefers-contrast: more)").matches;
		const pointerType = matchMedia("(pointer: fine)").matches ? "fine" : matchMedia("(pointer: coarse)").matches ? "coarse" : "none";
		const cpuCores = navigator.hardwareConcurrency;
		const maxTouchPoints = navigator.maxTouchPoints;
		const memoryGigabytes = navigator.deviceMemory;
		const online = navigator.onLine;
		const cookiesEnabled = navigator.cookieEnabled;
		const languages = navigator.languages.join(",");
		const colorScheme = darkMode ? "dark" : "light";
		analytics.dispatch("device_context", new DeviceContext(innerWidth, innerHeight, screenWidth, screenHeight, pixelRatio, colorDepth, timezone, darkMode, lowMotion, highContrast, pointerType, cpuCores, maxTouchPoints, memoryGigabytes, online, cookiesEnabled, languages));
		analytics.setProperties(new UserProperties(cpuCores, colorScheme, lowMotion, pointerType, memoryGigabytes));
	}
}
//#endregion
