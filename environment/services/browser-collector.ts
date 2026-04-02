"use strict";

import "adaptive-extender/web";

import { BrowserContext } from "../models/analytics.js";

export class BrowserCollector {
	#emit: (name: string, params: object) => void;

	constructor(emit: (name: string, params: object) => void) {
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
				uaData = await navigator.userAgentData.getHighEntropyValues(["architecture", "model", "platformVersion", "bitness", "fullVersionList"]);
				const brands = navigator.userAgentData.brands.filter(b => !b.brand.includes("Not")).map(b => `${b.brand} ${b.version}`).join(", ");
				uaBrands = brands || undefined;
				const fullList = uaData.fullVersionList?.filter(b => !b.brand.includes("Not")).map(b => `${b.brand} ${b.version}`).join(", ");
				uaVersion = fullList || undefined;
			} catch (reason) {
				console.error(`UA-CH collection failed:\n${Error.from(reason)}`);
			}
		}

		const context = new BrowserContext(
			navigator.userAgent, navigator.platform, navigator.vendor, navigator.language,
			navigator.doNotTrack ?? undefined,
			uaBrands, navigator.userAgentData?.mobile, navigator.userAgentData?.platform,
			uaVersion, uaData?.architecture, uaData?.model,
		);
		this.#emit("browser_context", BrowserContext.export(context));
	}
}
