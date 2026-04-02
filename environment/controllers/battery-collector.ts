"use strict";

import "adaptive-extender/web";
import { BatteryContext } from "../models/battery-context.js";
import { analytics } from "../services/analytics-service.js";
import { Controller } from "adaptive-extender/web";

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

export class BatteryCollector extends Controller {
	async run(): Promise<void> {
		if (!navigator.getBattery) return;
		const battery = await navigator.getBattery();
		this.#dispatch(battery);
		battery.addEventListener("levelchange", event => this.#dispatch(battery));
		battery.addEventListener("chargingchange", event => this.#dispatch(battery));
	}

	#dispatch(battery: BatteryManager): void {
		const { level, charging } = battery;
		const chargingTime = battery.chargingTime.insteadInfinity(undefined);
		const dischargingTime = battery.dischargingTime.insteadInfinity(undefined);
		analytics.dispatch("battery_context", new BatteryContext(level, charging, chargingTime, dischargingTime));
	}

	async catch(error: Error): Promise<void> {
		console.error(`Battery API failed:\n${error}`);
	}
}
//#endregion
