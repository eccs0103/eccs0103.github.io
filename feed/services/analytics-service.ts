"use strict";

declare global {
	export interface Window {
		dataLayer: any[];
		gtag(...args: any): void;
	}
}

window.dataLayer = window.dataLayer || [];
window.gtag = function (): void {
	window.dataLayer.push(arguments);
};

const id = "G-1N3MKL65T7";

window.gtag("js", new Date());
window.gtag("config", id);

const script = document.createElement("script");
script.async = true;
script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
document.head.appendChild(script);
