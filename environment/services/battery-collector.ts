"use strict";

import "adaptive-extender/web";
import { BatteryContext } from "../models/battery-context.js";
import { Collector } from "./analytics-service.js";

//#region Battery collector
declare global {
	export interface BatteryManager extends EventTarget {
		level: number;
		charging: boolean;
		chargingTime: number;
		dischargingTime: number;
	}

	export interface Navigator {
		getBattery?(): Promise<BatteryManager>;
	}
}

export class BatteryCollector extends Collector {
	async collect(): Promise<void> {
		try {
			await this.#init();
		} catch (reason) {
			console.error(`Battery API failed:\n${Error.from(reason)}`);
		}
	}

	async #init(): Promise<void> {
		if (!navigator.getBattery) return;
		const battery = await navigator.getBattery();
		this.#emitBattery(battery);
		battery.addEventListener("levelchange", event => this.#emitBattery(battery));
		battery.addEventListener("chargingchange", event => this.#emitBattery(battery));
	}

	#emitBattery(battery: BatteryManager): void {
		const { level, charging } = battery;
		const chargingTime = battery.chargingTime.insteadInfinity(undefined);
		const dischargingTime = battery.dischargingTime.insteadInfinity(undefined);
		this.dispatch("battery_context", new BatteryContext(level, charging, chargingTime, dischargingTime));
	}
}
//#endregion
