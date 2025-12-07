"use strict";

declare global {
	export interface Window {
		dataLayer: any[];
	}
}

const id = "G-1N3MKL65T7";

window.dataLayer = window.dataLayer || [];

function gtag(...args: any[]) {
	window.dataLayer.push(arguments);
}

gtag("js", new Date());
gtag("config", id);

const script = document.head.appendChild(document.createElement("script"));
script.async = true;
script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
