"use strict";

import "adaptive-extender/web";
import { BrowserContext } from "../models/browser-context.js";
import { Collector } from "./analytics-service.js";

//#region Browser collector
declare global {
	export interface NavigatorUAData {
		brands: readonly { brand: string; version: string; }[];
		mobile: boolean;
		platform: string;
		getHighEntropyValues(hints: string[]): Promise<UADataValues>;
	}

	export interface UADataValues {
		architecture?: string;
		model?: string;
		platformVersion?: string;
		bitness?: string;
		fullVersionList?: readonly { brand: string; version: string; }[];
	}

	export interface Navigator {
		userAgentData?: NavigatorUAData;
	}
}

export class BrowserCollector extends Collector {
	collect(): void {
		void this.#init();
	}

	async #init(): Promise<void> {
		const { brands, version, data } = await this.#fetchUaCh();
		const { navigator } = window;
		const context = new BrowserContext(
			navigator.userAgent, navigator.platform, navigator.vendor, navigator.language,
			(navigator.doNotTrack ?? String.empty).insteadEmpty(undefined),
			brands, navigator.userAgentData?.mobile, navigator.userAgentData?.platform,
			version, data?.architecture, data?.model,
		);
		this.emit("browser_context", BrowserContext, context);
	}

	async #fetchUaCh(): Promise<{ brands: string | undefined; version: string | undefined; data: UADataValues | undefined; }> {
		if (!navigator.userAgentData) return { brands: undefined, version: undefined, data: undefined };
		try {
			const data = await navigator.userAgentData.getHighEntropyValues(["architecture", "model", "platformVersion", "bitness", "fullVersionList"]);
			const brands = navigator.userAgentData.brands.filter(b => !b.brand.includes("Not")).map(b => `${b.brand} ${b.version}`).join(", ").insteadEmpty(undefined);
			const version = data.fullVersionList?.filter(b => !b.brand.includes("Not")).map(b => `${b.brand} ${b.version}`).join(", ").insteadEmpty(undefined);
			return { brands, version, data };
		} catch (reason) {
			console.error(`UA-CH collection failed:\n${Error.from(reason)}`);
			return { brands: undefined, version: undefined, data: undefined };
		}
	}
}
//#endregion
