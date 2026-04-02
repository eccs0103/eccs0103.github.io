"use strict";

import "adaptive-extender/web";

import { NetworkContext } from "../models/analytics.js";

export class NetworkCollector {
	#emit: (name: string, params: object) => void;

	constructor(emit: (name: string, params: object) => void) {
		this.#emit = emit;
	}

	collect(): void {
		const { connection } = navigator;
		const context = new NetworkContext(navigator.onLine, connection?.type, connection?.effectiveType, connection?.downlink, connection?.rtt, connection?.saveData);
		this.#emit("network_context", NetworkContext.export(context));
	}
}
