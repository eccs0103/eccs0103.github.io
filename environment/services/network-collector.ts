"use strict";

import "adaptive-extender/web";
import { NetworkContext } from "../models/network-context.js";
import { analytics, Collector } from "./analytics-service.js";

//#region Network collector
declare global {
	export interface NetworkInformation extends EventTarget {
		type?: string;
		effectiveType?: string;
		downlink?: number;
		rtt?: number;
		saveData?: boolean;
	}

	export interface Navigator {
		connection?: NetworkInformation;
	}
}

export class NetworkCollector extends Collector {
	async collect(): Promise<void> {
		return this.#emit();
	}

	#emit(): void {
		const { connection, onLine } = navigator;
		const connectionType = connection?.type;
		const effectiveType = connection?.effectiveType;
		const downlink = connection?.downlink;
		const rtt = connection?.rtt;
		const saveData = connection?.saveData;
		analytics.dispatch("network_context", new NetworkContext(onLine, connectionType, effectiveType, downlink, rtt, saveData));
	}
}
//#endregion
