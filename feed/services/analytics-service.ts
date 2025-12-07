"use strict";

const id = "G-1N3MKL65T7";

const script = document.head.appendChild(document.createElement("script"));
script.async = true;
script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;

declare global {
	export interface Window {
		dataLayer?: any[];
	}
}

function gtag(layer: any[], ...args: any): void {
	layer.push(args);
}

window.dataLayer = window.dataLayer || [];
gtag(window.dataLayer, "js", new Date());
gtag(window.dataLayer, "config", id);
