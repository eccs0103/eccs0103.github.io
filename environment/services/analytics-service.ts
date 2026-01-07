"use strict";

//#region G Tag
declare global {
	export interface Window {
		dataLayer: any[];
		gtag(...args: any[]): void;
	}
}

window.dataLayer ??= [];

window.gtag = function (...args: any[]): void {
	window.dataLayer.push(args);
};
//#endregion
//#region Analytics service
class AnalyticsService {
	static #lock: boolean = true;
	static #instance: AnalyticsService | null = null;

	constructor(id: string) {
		if (AnalyticsService.#lock) throw new TypeError("Illegal constructor");

		window.gtag("js", new Date());
		window.gtag("config", id);

		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
		document.head.appendChild(script);
	}

	static get instance(): AnalyticsService {
		if (AnalyticsService.#instance === null) {
			AnalyticsService.#lock = false;
			AnalyticsService.#instance = new AnalyticsService("G-1N3MKL65T7");
			AnalyticsService.#lock = true;
		}
		return AnalyticsService.#instance;
	}
}

export const analytics = AnalyticsService.instance;
//#endregion
