"use strict";

import "adaptive-extender/web";
import { type Sensor } from "../models/sensor.js";
import { type SystemNode } from "../models/system-node.js";
import { TelemetryService } from "../services/telemetry-service.js";

//#region HUD builder
export class HUDBuilder {
	static newIcon(url: Readonly<URL>): HTMLElement {
		const icon = document.createElement("span");
		icon.classList.add("icon");
		icon.style.setProperty("--url", `url("${url}")`);

		return icon;
	}

	static newSensor(sensor: Sensor, root: Readonly<URL>): HTMLElement {
		const element = sensor.webpage === null ? document.createElement("div") : document.createElement("a");
		element.classList.add("hud-sensor");
		element.dataset["status"] = sensor.status ?? "none";
		if (sensor.note !== null) element.title = sensor.note;
		if (element instanceof HTMLAnchorElement && sensor.webpage !== null) {
			element.href = sensor.webpage;
			element.target = "_blank";
			element.rel = "noopener noreferrer";
		}

		const light = element.appendChild(document.createElement("span"));
		light.classList.add("sensor-light");
		light.dataset["status"] = sensor.status ?? "none";
		light.style.setProperty("--pulse-duration", TelemetryService.pulseDuration(sensor.status));

		const icon = element.appendChild(HUDBuilder.newIcon(new URL(sensor.icon, root)));
		icon.classList.add("hud-sensor-icon");

		const name = element.appendChild(document.createElement("span"));
		name.classList.add("hud-sensor-name");
		name.textContent = sensor.name;

		return element;
	}

	static newNodeTile(node: SystemNode): HTMLElement {
		const isReachable = node.isReachable();
		const element = isReachable ? document.createElement("a") : document.createElement("div");
		element.classList.add("hud-node");
		element.dataset["status"] = node.status;
		if (element instanceof HTMLAnchorElement && node.href !== null) {
			element.href = node.href;
			if (node.opensExternally()) {
				element.target = "_blank";
				element.rel = "noopener noreferrer";
			}
		} else {
			element.ariaDisabled = "true";
		}

		const callsign = element.appendChild(document.createElement("span"));
		callsign.classList.add("hud-node-callsign");
		callsign.textContent = node.callsign;

		const status = element.appendChild(document.createElement("span"));
		status.classList.add("hud-node-status");
		status.textContent = node.statusLabel;

		const name = element.appendChild(document.createElement("strong"));
		name.classList.add("hud-node-name");
		name.textContent = node.name;

		const description = element.appendChild(document.createElement("span"));
		description.classList.add("hud-node-description", "font-smaller-2");
		description.textContent = node.description;

		return element;
	}

	static newWaveformBar(value: number): HTMLElement {
		const bar = document.createElement("span");
		bar.classList.add("hud-waveform-bar");
		bar.style.setProperty("--value", String(value));

		return bar;
	}
}
//#endregion
