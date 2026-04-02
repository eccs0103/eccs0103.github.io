"use strict";

import "adaptive-extender/web";

import { DeviceContext } from "../models/analytics.js";

export class DeviceCollector {
	#emit: (name: string, params: object) => void;

	constructor(emit: (name: string, params: object) => void) {
		this.#emit = emit;
	}

	collect(): void {
		const { navigator, screen, devicePixelRatio } = window;
		const pointerType = matchMedia("(pointer: fine)").matches ? "fine" : matchMedia("(pointer: coarse)").matches ? "coarse" : "none";

		const context = new DeviceContext(
			window.innerWidth, window.innerHeight,
			screen.width, screen.height,
			devicePixelRatio, screen.colorDepth,
			Intl.DateTimeFormat().resolvedOptions().timeZone,
			matchMedia("(prefers-color-scheme: dark)").matches,
			matchMedia("(prefers-reduced-motion: reduce)").matches,
			matchMedia("(prefers-contrast: more)").matches,
			pointerType,
			navigator.hardwareConcurrency, navigator.maxTouchPoints,
			navigator.deviceMemory,
			navigator.onLine, navigator.cookieEnabled,
			navigator.languages.join(","),
		);
		this.#emit("device_context", DeviceContext.export(context));

		window.gtag("set", "user_properties", {
			cpu_cores: navigator.hardwareConcurrency,
			dark_mode: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
			low_motion: matchMedia("(prefers-reduced-motion: reduce)").matches,
			pointer_type: pointerType,
			memory_gigabytes: navigator.deviceMemory ?? null,
		});
	}
}
