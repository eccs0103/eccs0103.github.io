"use strict";

import "adaptive-extender/web";

//#region Analytics service
declare global {
	interface Window {
		dataLayer?: unknown[];
	}
}

export class AnalyticsService {
	#id: string;

	constructor(id: string) {
		this.#id = id;
	}

	#loadAnalyticsScript(): void {
		const scriptElement = document.head.appendChild(document.createElement("script"));
		scriptElement.async = true;
		scriptElement.src = `https://www.googletagmanager.com/gtag/js?id=${this.#id}`;
	}

	#pushToDataLayer(...args: unknown[]): void {
		if (window.dataLayer === undefined) {
			window.dataLayer = [];
		}
		window.dataLayer.push(args);
	}

	setup(): void {
		this.#loadAnalyticsScript();
		this.#pushToDataLayer("js", new Date());
		this.#pushToDataLayer("config", this.#id);
	}

	logEvent(event: string, params?: Record<string, unknown>): void {
		this.#pushToDataLayer("event", event, params);
	}
}
//#endregion
