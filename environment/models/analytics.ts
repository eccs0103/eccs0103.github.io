"use strict";

import "adaptive-extender/core";

import { Field, Model, Optional } from "adaptive-extender/core";

//#region Extension API declarations
declare global {
	export interface Window {
		dataLayer: any[];
		gtag(...args: any[]): void;
	}

	export interface LayoutShift extends PerformanceEntry {
		value: number;
		hadRecentInput: boolean;
	}

	export interface BatteryManager extends EventTarget {
		level: number;
		charging: boolean;
		chargingTime: number;
		dischargingTime: number;
	}

	export interface NetworkInformation extends EventTarget {
		type?: string;
		effectiveType?: string;
		downlink?: number;
		rtt?: number;
		saveData?: boolean;
	}

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
		getBattery?: () => Promise<BatteryManager>;
		connection?: NetworkInformation;
		deviceMemory?: number;
		userAgentData?: NavigatorUAData;
	}

	export interface PerformanceObserverInit {
		durationThreshold?: number;
	}
}
//#endregion

//#region DeviceContext
export interface DeviceContextScheme {
	viewport_width: number;
	viewport_height: number;
	screen_width: number;
	screen_height: number;
	pixel_ratio: number;
	bit_depth: number;
	timezone: string;
	dark_mode: boolean;
	low_motion: boolean;
	high_contrast: boolean;
	pointer_type: string;
	cpu_cores: number;
	max_touch_points: number;
	memory_gigabytes?: number;
	online: boolean;
	cookies_enabled: boolean;
	languages: string;
}

export class DeviceContext extends Model {
	@Field(Number, "viewport_width")
	viewportWidth: number;

	@Field(Number, "viewport_height")
	viewportHeight: number;

	@Field(Number, "screen_width")
	screenWidth: number;

	@Field(Number, "screen_height")
	screenHeight: number;

	@Field(Number, "pixel_ratio")
	pixelRatio: number;

	@Field(Number, "bit_depth")
	bitDepth: number;

	@Field(String, "timezone")
	timezone: string;

	@Field(Boolean, "dark_mode")
	darkMode: boolean;

	@Field(Boolean, "low_motion")
	lowMotion: boolean;

	@Field(Boolean, "high_contrast")
	highContrast: boolean;

	@Field(String, "pointer_type")
	pointerType: string;

	@Field(Number, "cpu_cores")
	cpuCores: number;

	@Field(Number, "max_touch_points")
	maxTouchPoints: number;

	@Field(Optional(Number), "memory_gigabytes")
	memoryGigabytes: number | undefined;

	@Field(Boolean, "online")
	online: boolean;

	@Field(Boolean, "cookies_enabled")
	cookiesEnabled: boolean;

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

//#region BrowserContext
export interface BrowserContextScheme {
	user_agent: string;
	platform: string;
	vendor: string;
	language: string;
	do_not_track?: string;
	ua_brands?: string;
	ua_mobile?: boolean;
	ua_platform?: string;
	ua_version?: string;
	ua_architecture?: string;
	ua_device_model?: string;
}

export class BrowserContext extends Model {
	@Field(String, "user_agent")
	userAgent: string;

	@Field(String, "platform")
	platform: string;

	@Field(String, "vendor")
	vendor: string;

	@Field(String, "language")
	language: string;

	@Field(Optional(String), "do_not_track")
	doNotTrack: string | undefined;

	@Field(Optional(String), "ua_brands")
	uaBrands: string | undefined;

	@Field(Optional(Boolean), "ua_mobile")
	uaMobile: boolean | undefined;

	@Field(Optional(String), "ua_platform")
	uaPlatform: string | undefined;

	@Field(Optional(String), "ua_version")
	uaVersion: string | undefined;

	@Field(Optional(String), "ua_architecture")
	uaArchitecture: string | undefined;

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

//#region NetworkContext
export interface NetworkContextScheme {
	online: boolean;
	connection_type?: string;
	effective_type?: string;
	downlink?: number;
	round_trip_time_milliseconds?: number;
	save_data?: boolean;
}

export class NetworkContext extends Model {
	@Field(Boolean, "online")
	online: boolean;

	@Field(Optional(String), "connection_type")
	connectionType: string | undefined;

	@Field(Optional(String), "effective_type")
	effectiveType: string | undefined;

	@Field(Optional(Number), "downlink")
	downlink: number | undefined;

	@Field(Optional(Number), "round_trip_time_milliseconds")
	roundTripTimeMilliseconds: number | undefined;

	@Field(Optional(Boolean), "save_data")
	saveData: boolean | undefined;

	constructor();
	constructor(online: boolean, connectionType: string | undefined, effectiveType: string | undefined, downlink: number | undefined, roundTripTimeMilliseconds: number | undefined, saveData: boolean | undefined);
	constructor(online?: boolean, connectionType?: string, effectiveType?: string, downlink?: number, roundTripTimeMilliseconds?: number, saveData?: boolean) {
		if (online === undefined) {
			super();
			return;
		}

		super();
		this.online = online;
		this.connectionType = connectionType;
		this.effectiveType = effectiveType;
		this.downlink = downlink;
		this.roundTripTimeMilliseconds = roundTripTimeMilliseconds;
		this.saveData = saveData;
	}
}
//#endregion

//#region BatteryContext
export interface BatteryContextScheme {
	level: number;
	charging: boolean;
	charging_time?: number;
	discharging_time?: number;
}

export class BatteryContext extends Model {
	@Field(Number, "level")
	level: number;

	@Field(Boolean, "charging")
	charging: boolean;

	@Field(Optional(Number), "charging_time")
	chargingTime: number | undefined;

	@Field(Optional(Number), "discharging_time")
	dischargingTime: number | undefined;

	constructor();
	constructor(level: number, charging: boolean, chargingTime: number | undefined, dischargingTime: number | undefined);
	constructor(level?: number, charging?: boolean, chargingTime?: number, dischargingTime?: number) {
		if (level === undefined || charging === undefined) {
			super();
			return;
		}

		super();
		this.level = level;
		this.charging = charging;
		this.chargingTime = chargingTime;
		this.dischargingTime = dischargingTime;
	}
}
//#endregion

//#region PageLoad
export interface PageLoadScheme {
	navigation_type: string;
	dom_interactive_milliseconds: number;
	load_event_milliseconds: number;
	transfer_size: number;
}

export class PageLoad extends Model {
	@Field(String, "navigation_type")
	navigationType: string;

	@Field(Number, "dom_interactive_milliseconds")
	domInteractiveMilliseconds: number;

	@Field(Number, "load_event_milliseconds")
	loadEventMilliseconds: number;

	@Field(Number, "transfer_size")
	transferSize: number;

	constructor();
	constructor(navigationType: string, domInteractiveMilliseconds: number, loadEventMilliseconds: number, transferSize: number);
	constructor(navigationType?: string, domInteractiveMilliseconds?: number, loadEventMilliseconds?: number, transferSize?: number) {
		if (navigationType === undefined || domInteractiveMilliseconds === undefined || loadEventMilliseconds === undefined || transferSize === undefined) {
			super();
			return;
		}

		super();
		this.navigationType = navigationType;
		this.domInteractiveMilliseconds = domInteractiveMilliseconds;
		this.loadEventMilliseconds = loadEventMilliseconds;
		this.transferSize = transferSize;
	}
}
//#endregion

//#region WebVital
export interface WebVitalScheme {
	vital_name: string;
	vital_value: number;
}

export class WebVital extends Model {
	@Field(String, "vital_name")
	vitalName: string;

	@Field(Number, "vital_value")
	vitalValue: number;

	constructor();
	constructor(vitalName: string, vitalValue: number);
	constructor(vitalName?: string, vitalValue?: number) {
		if (vitalName === undefined || vitalValue === undefined) {
			super();
			return;
		}

		super();
		this.vitalName = vitalName;
		this.vitalValue = vitalValue;
	}
}
//#endregion

//#region ScrollDepthHit
export interface ScrollDepthHitScheme {
	scroll_percent: number;
}

export class ScrollDepthHit extends Model {
	@Field(Number, "scroll_percent")
	scrollPercent: number;

	constructor();
	constructor(scrollPercent: number);
	constructor(scrollPercent?: number) {
		if (scrollPercent === undefined) {
			super();
			return;
		}

		super();
		this.scrollPercent = scrollPercent;
	}
}
//#endregion

//#region PageLeave
export interface PageLeaveScheme {
	time_on_page: number;
	max_scroll_percent: number;
}

export class PageLeave extends Model {
	@Field(Number, "time_on_page")
	timeOnPage: number;

	@Field(Number, "max_scroll_percent")
	maxScrollPercent: number;

	constructor();
	constructor(timeOnPage: number, maxScrollPercent: number);
	constructor(timeOnPage?: number, maxScrollPercent?: number) {
		if (timeOnPage === undefined || maxScrollPercent === undefined) {
			super();
			return;
		}

		super();
		this.timeOnPage = timeOnPage;
		this.maxScrollPercent = maxScrollPercent;
	}
}
//#endregion

//#region OutboundClick
export interface OutboundClickScheme {
	link_url: string;
	link_text: string;
}

export class OutboundClick extends Model {
	@Field(String, "link_url")
	linkUrl: string;

	@Field(String, "link_text")
	linkText: string;

	constructor();
	constructor(linkUrl: string, linkText: string);
	constructor(linkUrl?: string, linkText?: string) {
		if (linkUrl === undefined || linkText === undefined) {
			super();
			return;
		}

		super();
		this.linkUrl = linkUrl;
		this.linkText = linkText;
	}
}
//#endregion

//#region TextCopy
export interface TextCopyScheme {
	copy_text: string;
}

export class TextCopy extends Model {
	@Field(String, "copy_text")
	text: string;

	constructor();
	constructor(text: string);
	constructor(text?: string) {
		if (text === undefined) {
			super();
			return;
		}

		super();
		this.text = text;
	}
}
//#endregion

//#region JavaScriptError
export interface JavaScriptErrorScheme {
	error_message: string;
	error_source?: string;
	error_line?: number;
}

export class JavaScriptError extends Model {
	@Field(String, "error_message")
	errorMessage: string;

	@Field(Optional(String), "error_source")
	errorSource: string | undefined;

	@Field(Optional(Number), "error_line")
	errorLine: number | undefined;

	constructor();
	constructor(errorMessage: string, errorSource: string | undefined, errorLine: number | undefined);
	constructor(errorMessage?: string, errorSource?: string, errorLine?: number) {
		if (errorMessage === undefined) {
			super();
			return;
		}

		super();
		this.errorMessage = errorMessage;
		this.errorSource = errorSource;
		this.errorLine = errorLine;
	}
}
//#endregion
