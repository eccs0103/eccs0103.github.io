"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { ClientBridge } from "../services/client-bridge.js";
import { type Bridge } from "../services/bridge.js";
import { DashboardConfiguration } from "../models/configuration.js";
import { SystemNode, type SystemNodeScheme } from "../models/system-node.js";
import { type Sensor, SensorFeed } from "../models/sensor.js";
import { ActivityMeta, ActivityPulse, type ActivityPulseScheme } from "../models/activity-pulse.js";
import { SensorArrayRenderer } from "../view/sensor-array-renderer.js";
import { TelemetryRenderer } from "../view/telemetry-renderer.js";
import { NavConsoleRenderer } from "../view/nav-console-renderer.js";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";

const { baseURI, body } = document;

//#region Dashboard controller
class DashboardController extends Controller {
	#bridge: Bridge = new ClientBridge();

	async #readConfiguration(url: Readonly<URL>): Promise<DashboardConfiguration> {
		const content = await this.#bridge.read(url);
		if (content === null) throw new ReferenceError(`Missing configuration at ${url.pathname}`);
		const object = JSON.parse(content);
		return DashboardConfiguration.import(object, "configuration");
	}

	async #readNodes(url: Readonly<URL>): Promise<SystemNode[]> {
		const content = await this.#bridge.read(url);
		if (content === null) throw new ReferenceError(`Missing nodes at ${url.pathname}`);
		const object = JSON.parse(content);
		return Array.Of<SystemNode, SystemNodeScheme>(SystemNode).import(object, "nodes");
	}

	async #readSensors(url: Readonly<URL>): Promise<Sensor[]> {
		const content = await this.#bridge.read(url);
		if (content === null) throw new ReferenceError(`Missing sensors at ${url.pathname}`);
		const object = JSON.parse(content);
		return SensorFeed.import(object, "sensors").platforms;
	}

	async #readRecentPulses(root: Readonly<URL>): Promise<ActivityPulse[]> {
		const metaContent = await this.#bridge.read(new URL("meta.json", root));
		if (metaContent === null) return [];
		const meta = ActivityMeta.import(JSON.parse(metaContent), "meta");
		if (meta.length < 1) return [];
		const chunkContent = await this.#bridge.read(new URL(`${meta.length - 1}.json`, root));
		if (chunkContent === null) return [];
		return Array.Of<ActivityPulse, ActivityPulseScheme>(ActivityPulse).import(JSON.parse(chunkContent), "pulses");
	}

	async #launchIdentity(callsign: HTMLElement, intro: HTMLElement, promiseConfiguration: Promise<DashboardConfiguration>): Promise<void> {
		const configuration = await promiseConfiguration;
		callsign.textContent = configuration.callsign;
		intro.textContent = configuration.intro;
	}

	async #launchTelemetry(panel: HTMLElement, promiseConfiguration: Promise<DashboardConfiguration>, promisePulses: Promise<ActivityPulse[]>): Promise<void> {
		const [configuration, pulses] = await Promise.all([promiseConfiguration, promisePulses]);
		await TelemetryRenderer.launch(panel, configuration, pulses);
	}

	async #launchSensors(panel: HTMLElement, promiseSensors: Promise<Sensor[]>, root: Readonly<URL>): Promise<void> {
		const sensors = await promiseSensors;
		await SensorArrayRenderer.launch(panel, sensors, root);
	}

	async #launchNav(panel: HTMLElement, promiseNodes: Promise<SystemNode[]>): Promise<void> {
		const nodes = await promiseNodes;
		await NavConsoleRenderer.launch(panel, nodes);
	}

	async run(): Promise<void> {
		const root = new URL(baseURI);
		const promiseConfiguration = this.#readConfiguration(new URL("./data/dashboard-configuration.json", root));
		const promiseNodes = this.#readNodes(new URL("./data/dashboard-nodes.json", root));
		const promiseSensors = this.#readSensors(new URL("./data/feed-configuration.json", root));
		const promisePulses = this.#readRecentPulses(new URL("./data/activities/", root));

		const callsign = await body.getElementAsync(HTMLElement, "#bridge-callsign");
		const intro = await body.getElementAsync(HTMLElement, "#bridge-intro");
		const panelTelemetry = await body.getElementAsync(HTMLElement, "#panel-telemetry");
		const panelSensors = await body.getElementAsync(HTMLElement, "#panel-sensors");
		const panelNav = await body.getElementAsync(HTMLElement, "#panel-nav");
		const footer = await body.getElementAsync(HTMLElement, "#footer-year");
		footer.textContent = String(new Date().getFullYear());

		const promiseIdentity = this.#launchIdentity(callsign, intro, promiseConfiguration);
		const promiseTelemetry = this.#launchTelemetry(panelTelemetry, promiseConfiguration, promisePulses);
		const promiseSensorArray = this.#launchSensors(panelSensors, promiseSensors, root);
		const promiseNav = this.#launchNav(panelNav, promiseNodes);
		const promiseAnalytics = AnalyticsController.launch();

		await Promise.all([promiseIdentity, promiseTelemetry, promiseSensorArray, promiseNav, promiseAnalytics]);
	}

	async catch(error: Error): Promise<void> {
		console.error(error);
	}
}
//#endregion

await DashboardController.launch();
