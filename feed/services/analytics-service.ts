"use strict";

import "adaptive-extender/web";

//#region Analytics service
declare global {
	export interface Window {
		dataLayer: any[];
	}
}

export class AnalyticsService {
	constructor(id: string) {
		window.dataLayer = window.dataLayer || [];
		this.#gtag(window.dataLayer, "js", new Date());
		this.#gtag(window.dataLayer, "config", id);

		const script = document.head.appendChild(document.createElement("script"));
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
	}

	#gtag(layer: any[], ...args: any[]): void {
		layer.push(args);
	}
}
//#endregion

new AnalyticsService("G-1N3MKL65T7");
