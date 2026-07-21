"use strict";

import "adaptive-extender/web";
import { Controller, Timespan } from "adaptive-extender/web";
import { type DashboardConfiguration } from "../models/configuration.js";
import { type ActivityPulse } from "../models/activity-pulse.js";
import { TelemetryService } from "../services/telemetry-service.js";
import { HUDBuilder } from "./hud-builder.js";

const { max } = Math;

//#region Telemetry renderer
export class TelemetryRenderer extends Controller<[HTMLElement, DashboardConfiguration, readonly ActivityPulse[]]> {
	#newReadoutRow(container: HTMLElement, label: string): HTMLElement {
		const row = container.appendChild(document.createElement("div"));
		row.classList.add("hud-readout-row");

		const spanLabel = row.appendChild(document.createElement("span"));
		spanLabel.classList.add("hud-readout-label");
		spanLabel.textContent = label;

		const spanValue = row.appendChild(document.createElement("span"));
		spanValue.classList.add("hud-readout-value");

		return spanValue;
	}

	#renderWaveform(container: HTMLElement, pulses: readonly ActivityPulse[]): void {
		const waveform = container.appendChild(document.createElement("div"));
		waveform.classList.add("hud-waveform");

		const span = Timespan.fromComponents(7, 0, 0, 0);
		const counts = TelemetryService.buildHistogram(pulses, 28, span);
		const peak = max(1, ...counts);
		for (const count of counts) {
			waveform.appendChild(HUDBuilder.newWaveformBar(count / peak));
		}
	}

	async run(panel: HTMLElement, configuration: DashboardConfiguration, pulses: readonly ActivityPulse[]): Promise<void> {
		const body = await panel.getElementAsync(HTMLElement, ".hud-panel-body");
		const telemetry = body.appendChild(document.createElement("div"));
		telemetry.classList.add("hud-telemetry");

		const clockValue = this.#newReadoutRow(telemetry, "Ship time");
		const uptimeValue = configuration.launched === null ? null : this.#newReadoutRow(telemetry, "Uptime");
		const signalAgeValue = this.#newReadoutRow(telemetry, "Last sync");

		const latest = TelemetryService.latestTimestamp(pulses);
		const tick = (): void => {
			clockValue.textContent = TelemetryService.formatClock(new Date());
			if (uptimeValue !== null) uptimeValue.textContent = TelemetryService.formatUptime(configuration.launched);
			signalAgeValue.textContent = TelemetryService.formatSignalAge(latest);
		};
		tick();
		setInterval(tick, 1000);

		this.#renderWaveform(telemetry, pulses);

		panel.classList.replace("awaiting-boot", "booted");
	}
}
//#endregion
