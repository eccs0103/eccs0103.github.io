"use strict";

import "adaptive-extender/web";
import { BrowserContext } from "../models/browser-context.js";
import { analytics } from "./analytics-service.js";
import { Controller } from "adaptive-extender/web";

//#region Browser collector
declare global {
	export interface UaBrand {
		brand: string;
		version: string;
	}

	export interface NavigatorUAData {
		brands: readonly UaBrand[];
		mobile: boolean;
		platform: string;
		getHighEntropyValues(hints: string[]): Promise<UADataValues>;
	}

	export interface UADataValues {
		architecture?: string;
		model?: string;
		platformVersion?: string;
		bitness?: string;
		fullVersionList?: readonly UaBrand[];
	}

	export interface Navigator {
		userAgentData?: NavigatorUAData;
	}
}

export class BrowserCollector extends Controller {
	async run(): Promise<void> {
		const { userAgent, platform, vendor, language, userAgentData } = navigator;
		const doNotTrack = navigator.doNotTrack?.insteadEmpty(undefined);
		const uaBrands = userAgentData?.brands.filter(({ brand }) => !brand.includes("Not")).map(({ brand, version }) => `${brand} ${version}`).join(", ").insteadEmpty(undefined);
		const uaMobile = userAgentData?.mobile;
		const uaPlatform = userAgentData?.platform;
		const uaData = await userAgentData?.getHighEntropyValues(["architecture", "model", "platformVersion", "bitness", "fullVersionList"]);
		const uaVersion = uaData?.fullVersionList?.filter(({ brand }) => !brand.includes("Not")).map(({ brand, version }) => `${brand} ${version}`).join(", ").insteadEmpty(undefined);
		const uaArchitecture = uaData?.architecture;
		const uaDeviceModel = uaData?.model;
		analytics.dispatch("browser_context", new BrowserContext(userAgent, platform, vendor, language, doNotTrack, uaBrands, uaMobile, uaPlatform, uaVersion, uaArchitecture, uaDeviceModel));
	}

	async catch(error: Error): Promise<void> {
		console.error(`Browser collection failed:\n${error}`);
	}
}
//#endregion
