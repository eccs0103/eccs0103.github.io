"use strict";

const id = "G-1N3MKL65T7";

declare global {
	export interface Window {
		dataLayer: any[];
	}
}

window.dataLayer = window.dataLayer || [];
function gtag(...args: any[]): void {
	window.dataLayer.push(args);
}

gtag("js", new Date());
gtag("config", id, { 'debug_mode': true });

const script = document.head.appendChild(document.createElement("script"));
script.async = true;
script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;

console.log("Analytics initialized in Debug Mode");
