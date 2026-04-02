"use strict";

import "adaptive-extender/web";
import { type Model } from "adaptive-extender/web";
import { BatteryCollector } from "./battery-collector.js";
import { BrowserCollector } from "./browser-collector.js";
import { DeviceCollector } from "./device-collector.js";
import { EngagementCollector } from "./engagement-collector.js";
import { ErrorCollector } from "./error-collector.js";
import { InteractionCollector } from "./interaction-collector.js";
import { NetworkCollector } from "./network-collector.js";
import { SessionCollector } from "./session-collector.js";
import { WebVitalsCollector } from "./web-vitals-collector.js";
import { SessionIdentity } from "../models/session-identity.js";

//#region GTag
declare global {
	export interface Window {
		dataLayer: any[];
		gtag(...args: any[]): void;
	}
}

window.dataLayer ??= [];

window.gtag = function (): void {
	window.dataLayer.push(arguments);
};
//#endregion

//#region Collector base
export abstract class Collector {
	abstract collect(): Promise<void>;
}
//#endregion

//#region Analytics service
export class AnalyticsService {
	static #lock: boolean = true;
	static #instance: AnalyticsService | null = null;

	#session: SessionCollector = new SessionCollector();

	constructor(id: string) {
		if (AnalyticsService.#lock) throw new TypeError("Illegal constructor");

		const session = this.#session;

		window.gtag("js", new Date());
		window.gtag("config", id);
		window.gtag("set", SessionIdentity.export(new SessionIdentity(session.userFingerprint, session.sessionFingerprint)));

		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
		document.head.appendChild(script);

		void (new DeviceCollector).collect();
		void (new BrowserCollector).collect();
		void (new NetworkCollector).collect();
		void (new BatteryCollector).collect();
		void (new WebVitalsCollector).collect();
		void (new EngagementCollector).collect();
		void (new InteractionCollector).collect();
		void (new ErrorCollector).collect();
	}

	static get instance(): AnalyticsService {
		if (AnalyticsService.#instance === null) {
			AnalyticsService.#lock = false;
			AnalyticsService.#instance = new AnalyticsService("G-1N3MKL65T7");
			AnalyticsService.#lock = true;
		}
		return AnalyticsService.#instance;
	}

	event(name: string, params: object = {}): void {
		const session = this.#session;
		const identity = new SessionIdentity(session.userFingerprint, session.sessionFingerprint);
		window.gtag("event", name, Object.assign(SessionIdentity.export(identity), params));
	}

	dispatch<M extends Model>(name: string, instance: M): void {
		this.event(name, (instance.constructor as typeof Model).export(instance));
	}

	setProperties<M extends Model>(instance: M): void {
		window.gtag("set", "user_properties", (instance.constructor as typeof Model).export(instance));
	}
}

export const analytics = AnalyticsService.instance;
//#endregion
