"use strict";

import "adaptive-extender/web";
import { JavaScriptError } from "../models/javascript-error.js";
import { Collector } from "./analytics-service.js";

//#region ErrorCollector
export class ErrorCollector extends Collector {
	async collect(): Promise<void> {
		window.addEventListener("error", this.#onError.bind(this));
		window.addEventListener("unhandledrejection", this.#onReject.bind(this));
	}

	#onError(event: ErrorEvent): void {
		const errorMessage = event.message;
		const errorSource = event.filename.insteadEmpty(undefined);
		const errorLine = event.lineno.insteadZero(undefined);
		this.dispatch("js_error", new JavaScriptError(errorMessage, errorSource, errorLine));
	}

	#onReject(event: PromiseRejectionEvent): void {
		const errorMessage = Error.from(event.reason).message;
		this.dispatch("js_error", new JavaScriptError(errorMessage, undefined, undefined));
	}
}
//#endregion
