"use strict";

import "adaptive-extender/web";
import { NetworkContext } from "../models/network-context.js";
import { analytics } from "./analytics-service.js";
import { Controller } from "adaptive-extender/web";

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

export class NetworkCollector extends Controller {
	async run(): Promise<void> {
		const { connection, onLine } = navigator;
		const connectionType = connection?.type;
		const effectiveType = connection?.effectiveType;
		const downlink = connection?.downlink;
		const rtt = connection?.rtt;
		const saveData = connection?.saveData;
		analytics.dispatch("network_context", new NetworkContext(onLine, connectionType, effectiveType, downlink, rtt, saveData));
	}

	async catch(error: Error): Promise<void> {
		console.error(`Network collection failed:\n${error}`);
	}
}
//#endregion
