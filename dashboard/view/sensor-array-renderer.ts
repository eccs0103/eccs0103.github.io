"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { type Sensor } from "../models/sensor.js";
import { HUDBuilder } from "./hud-builder.js";

//#region Sensor array renderer
export class SensorArrayRenderer extends Controller<[HTMLElement, readonly Sensor[], Readonly<URL>]> {
	async run(panel: HTMLElement, sensors: readonly Sensor[], root: Readonly<URL>): Promise<void> {
		const body = await panel.getElementAsync(HTMLElement, ".hud-panel-body");
		const grid = body.appendChild(document.createElement("div"));
		grid.classList.add("hud-sensor-grid");

		for (const sensor of sensors) {
			grid.appendChild(HUDBuilder.newSensor(sensor, root));
		}

		panel.classList.replace("awaiting-boot", "booted");
	}
}
//#endregion
