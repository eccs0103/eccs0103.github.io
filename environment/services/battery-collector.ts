"use strict";

import "adaptive-extender/web";

import { BatteryContext } from "../models/analytics.js";

export class BatteryCollector {
	#emit: (name: string, params: object) => void;

	constructor(emit: (name: string, params: object) => void) {
		this.#emit = emit;
	}

	collect(): void {
		void this.#init();
	}

	async #init(): Promise<void> {
		if (!navigator.getBattery) return;
		try {
			const battery = await navigator.getBattery();
			this.#emitBattery(battery);
			battery.addEventListener("levelchange", () => this.#emitBattery(battery));
			battery.addEventListener("chargingchange", () => this.#emitBattery(battery));
		} catch (reason) {
			console.error(`Battery API failed:\n${Error.from(reason)}`);
		}
	}

	#emitBattery(battery: BatteryManager): void {
		const chargingTime = isFinite(battery.chargingTime) ? battery.chargingTime : undefined;
		const dischargingTime = isFinite(battery.dischargingTime) ? battery.dischargingTime : undefined;
		this.#emit("battery_context", BatteryContext.export(new BatteryContext(battery.level, battery.charging, chargingTime, dischargingTime)));
	}
}
