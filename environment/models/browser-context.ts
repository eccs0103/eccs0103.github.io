"use strict";

import "adaptive-extender/core";
import { Field, Model, Optional } from "adaptive-extender/core";

//#region Browser context
export class BrowserContext extends Model {
	/** Raw navigator.userAgent string including browser engine, version, OS, and device hints. Useful fallback when UA-CH is unavailable (Firefox, Safari). */
	@Field(String, "user_agent")
	userAgent: string;

	/** navigator.platform — OS platform string (e.g. "Win32", "MacIntel", "Linux x86_64"). Deprecated in the spec but available in all browsers; less reliable than ua_platform. */
	@Field(String, "platform")
	platform: string;

	/** navigator.vendor — browser vendor string. "Google Inc." in Chrome/Chromium, "" (empty) in Firefox, "Apple Computer, Inc." in Safari. */
	@Field(String, "vendor")
	vendor: string;

	/** navigator.language — primary language tag from browser UI settings (e.g. "en-US"). May differ from the OS locale. */
	@Field(String, "language")
	language: string;

	/** navigator.doNotTrack — "1" when the DNT request header is active, "0" when explicitly disabled, undefined in Safari which does not expose the value. */
	@Field(Optional(String), "do_not_track")
	doNotTrack: string | undefined;

	/** Formatted list of real UA-CH brand tokens excluding the "Not A Brand" noise entry (e.g. "Google Chrome 136, Chromium 136"). Present only in Chromium 90+; undefined in Firefox and Safari. */
	@Field(Optional(String), "ua_brands")
	uaBrands: string | undefined;

	/** navigator.userAgentData.mobile — true on mobile Chromium browsers. Always false on desktop Chromium. Absent in Firefox and Safari. */
	@Field(Optional(Boolean), "ua_mobile")
	uaMobile: boolean | undefined;

	/** navigator.userAgentData.platform — OS name via UA-CH (e.g. "Windows", "macOS", "Android"). More reliable than navigator.platform. Chromium only. */
	@Field(Optional(String), "ua_platform")
	uaPlatform: string | undefined;

	/** Full version strings from getHighEntropyValues fullVersionList, excluding noise brands (e.g. "Google Chrome 136.0.7103.114, Chromium 136.0.7103.114"). Chromium 90+ only. */
	@Field(Optional(String), "ua_version")
	uaVersion: string | undefined;

	/** CPU architecture hint from getHighEntropyValues (e.g. "x86", "arm", "arm64"). Chromium 90+ only. Empty if the user's permission policy blocks the hint. */
	@Field(Optional(String), "ua_architecture")
	uaArchitecture: string | undefined;

	/** Device model string from getHighEntropyValues (e.g. "Pixel 9 Pro", "SM-A546B"). Populated on Android Chrome; empty on desktops and iOS. */
	@Field(Optional(String), "ua_device_model")
	uaDeviceModel: string | undefined;

	constructor();
	constructor(userAgent: string, platform: string, vendor: string, language: string, doNotTrack: string | undefined, uaBrands: string | undefined, uaMobile: boolean | undefined, uaPlatform: string | undefined, uaVersion: string | undefined, uaArchitecture: string | undefined, uaDeviceModel: string | undefined);
	constructor(userAgent?: string, platform?: string, vendor?: string, language?: string, doNotTrack?: string, uaBrands?: string, uaMobile?: boolean, uaPlatform?: string, uaVersion?: string, uaArchitecture?: string, uaDeviceModel?: string) {
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
		this.uaArchitecture = uaArchitecture;
		this.uaDeviceModel = uaDeviceModel;
	}
}
//#endregion
