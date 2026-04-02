"use strict";

import "adaptive-extender/web";
import { DeviceContext } from "../models/device-context.js";
import { UserProperties } from "../models/user-properties.js";
import { Collector } from "./analytics-service.js";

declare global {
	interface Navigator {
		deviceMemory?: number;
	}
}

//#region DeviceCollector
export class DeviceCollector extends Collector {
	collect(): void {
		const { navigator, screen, devicePixelRatio } = window;
		const darkMode = matchMedia("(prefers-color-scheme: dark)").matches;
		const lowMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const highContrast = matchMedia("(prefers-contrast: more)").matches;
		const pointerType = matchMedia("(pointer: fine)").matches ? "fine" : matchMedia("(pointer: coarse)").matches ? "coarse" : "none";
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const languages = navigator.languages.join(",");
		this.dispatch("device_context", new DeviceContext(window.innerWidth, window.innerHeight, screen.width, screen.height, devicePixelRatio, screen.colorDepth, timezone, darkMode, lowMotion, highContrast, pointerType, navigator.hardwareConcurrency, navigator.maxTouchPoints, navigator.deviceMemory, navigator.onLine, navigator.cookieEnabled, languages));
		window.gtag("set", "user_properties", UserProperties.export(new UserProperties(navigator.hardwareConcurrency, darkMode ? "dark" : "light", lowMotion, pointerType, navigator.deviceMemory)));
	}
}
//#endregion
