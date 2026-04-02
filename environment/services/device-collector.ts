"use strict";

import "adaptive-extender/web";
import { DeviceContext } from "../models/device-context.js";
import { UserProperties } from "../models/user-properties.js";
import { analytics } from "./analytics-service.js";
import { Controller } from "adaptive-extender/web";

//#region Device collector
declare global {
	export interface Navigator {
		deviceMemory?: number;
	}
}

export class DeviceCollector extends Controller {
	async run(): Promise<void> {
		const { innerWidth, innerHeight } = window;
		const { width, height, colorDepth } = screen;
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const darkMode = matchMedia("(prefers-color-scheme: dark)").matches;
		const lowMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const highContrast = matchMedia("(prefers-contrast: more)").matches;
		const pointerType = matchMedia("(pointer: fine)").matches
			? "fine"
			: matchMedia("(pointer: coarse)").matches
				? "coarse"
				: "none";
		const { hardwareConcurrency, maxTouchPoints, deviceMemory, onLine, cookieEnabled } = navigator;
		const languages = navigator.languages.join(",");
		analytics.dispatch("device_context", new DeviceContext(innerWidth, innerHeight, width, height, devicePixelRatio, colorDepth, timezone, darkMode, lowMotion, highContrast, pointerType, hardwareConcurrency, maxTouchPoints, deviceMemory, onLine, cookieEnabled, languages));
		const colorScheme = darkMode
			? "dark"
			: "light";
		analytics.setProperties(new UserProperties(hardwareConcurrency, colorScheme, lowMotion, pointerType, deviceMemory));
	}

	async catch(error: Error): Promise<void> {
		console.error(`Device collection failed:\n${error}`);
	}
}
//#endregion
