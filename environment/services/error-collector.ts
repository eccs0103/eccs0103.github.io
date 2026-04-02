"use strict";

import "adaptive-extender/web";
import { JavaScriptError } from "../models/javascript-error.js";
import { Collector } from "./analytics-service.js";

//#region ErrorCollector
export class ErrorCollector extends Collector {
	collect(): void {
		window.addEventListener("error", this.#onError.bind(this));
		window.addEventListener("unhandledrejection", this.#onReject.bind(this));
	}

	#onError(event: ErrorEvent): void {
		this.dispatch("js_error", JavaScriptError, new JavaScriptError(event.message, event.filename.insteadEmpty(undefined), event.lineno.insteadZero(undefined)));
	}

	#onReject(event: PromiseRejectionEvent): void {
		this.dispatch("js_error", JavaScriptError, new JavaScriptError(Error.from(event.reason).message, undefined, undefined));
	}
}
//#endregion
