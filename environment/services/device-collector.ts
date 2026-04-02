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
		const pointerType = matchMedia("(pointer: fine)").matches ? "fine" : matchMedia("(pointer: coarse)").matches ? "coarse" : "none";

		const context = new DeviceContext(
			window.innerWidth, window.innerHeight,
			screen.width, screen.height,
			devicePixelRatio, screen.colorDepth,
			Intl.DateTimeFormat().resolvedOptions().timeZone,
			darkMode, lowMotion,
			matchMedia("(prefers-contrast: more)").matches,
			pointerType,
			navigator.hardwareConcurrency, navigator.maxTouchPoints,
			navigator.deviceMemory,
			navigator.onLine, navigator.cookieEnabled,
			navigator.languages.join(","),
		);
		this.dispatch("device_context", DeviceContext, context);

		window.gtag("set", "user_properties", UserProperties.export(new UserProperties(navigator.hardwareConcurrency, darkMode ? "dark" : "light", lowMotion, pointerType, navigator.deviceMemory)));
	}
}
//#endregion
