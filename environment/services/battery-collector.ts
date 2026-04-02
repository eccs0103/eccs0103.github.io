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
	collect(): void {
		void this.#init();
	}

	async #init(): Promise<void> {
		if (!navigator.getBattery) return;
		try {
			const battery = await navigator.getBattery();
			this.#emitBattery(battery);
			battery.addEventListener("levelchange", event => this.#emitBattery(battery));
			battery.addEventListener("chargingchange", event => this.#emitBattery(battery));
		} catch (reason) {
			console.error(`Battery API failed:\n${Error.from(reason)}`);
		}
	}

	#emitBattery(battery: BatteryManager): void {
		this.emit("battery_context", BatteryContext, new BatteryContext(battery.level, battery.charging, battery.chargingTime.insteadInfinity(undefined), battery.dischargingTime.insteadInfinity(undefined)));
	}
}
//#endregion
