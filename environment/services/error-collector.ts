"use strict";

import "adaptive-extender/web";

import { JavaScriptError } from "../models/analytics.js";

export class ErrorCollector {
	#emit: (name: string, params: object) => void;

	constructor(emit: (name: string, params: object) => void) {
		this.#emit = emit;
	}

	collect(): void {
		window.addEventListener("error", this.#onError.bind(this));
		window.addEventListener("unhandledrejection", this.#onReject.bind(this));
	}

	#onError(event: ErrorEvent): void {
		this.#emit("js_error", JavaScriptError.export(new JavaScriptError(event.message, event.filename || undefined, event.lineno || undefined)));
	}

	#onReject(event: PromiseRejectionEvent): void {
		this.#emit("js_error", JavaScriptError.export(new JavaScriptError(Error.from(event.reason).message, undefined, undefined)));
	}
}
