"use strict";

import "adaptive-extender/web";
import { NetworkContext } from "../models/network-context.js";
import { Collector } from "./analytics-service.js";

declare global {
	interface NetworkInformation extends EventTarget {
		type?: string;
		effectiveType?: string;
		downlink?: number;
		rtt?: number;
		saveData?: boolean;
	}

	interface Navigator {
		connection?: NetworkInformation;
	}
}

//#region NetworkCollector
export class NetworkCollector extends Collector {
	collect(): void {
		const { connection } = navigator;
		const context = new NetworkContext(navigator.onLine, connection?.type, connection?.effectiveType, connection?.downlink, connection?.rtt, connection?.saveData);
		this.dispatch("network_context", NetworkContext, context);
	}
}
//#endregion
