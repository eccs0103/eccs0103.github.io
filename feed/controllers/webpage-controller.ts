"use strict";

import "adaptive-extender/web";
import { ArrayOf, Controller } from "adaptive-extender/web";
import { ActivitiesRenderer } from "../view/activities-renderer.js";
import { ClientBridge } from "../services/client-bridge.js";
import { DataTable } from "../services/data-table.js";
import { Activity } from "../models/activity.js";
import { FooterRenderer } from "../view/footer-renderer.js";
import { MetadataInjector } from "../../environment/services/metadata-injector.js";
import { HeaderRenderer } from "../view/header-renderer.js";
import { Configuration } from "../models/configuration.js";
import { ChangelogEntry, type ChangelogEntryScheme } from "../models/changelog.js";
import { type Bridge } from "../services/bridge.js";
import { SettingsService } from "../services/settings-service.js";
import { ChangelogService } from "../services/changelog-service.js";
import { ChangelogRenderer } from "../view/changelog-renderer.js";
import { ProfileCollector } from "../../environment/controllers/profile-collector.js";
import { BatteryCollector } from "../../environment/controllers/battery-collector.js";
import { WebVitalsCollector } from "../../environment/controllers/web-vitals-collector.js";
import { EngagementCollector } from "../../environment/controllers/engagement-collector.js";
import { InteractionCollector } from "../../environment/controllers/interaction-collector.js";
import { ErrorCollector } from "../../environment/controllers/error-collector.js";

const { baseURI, body } = document;

//#region Webpage controller
class WebpageController extends Controller {
	#bridge: Bridge = new ClientBridge();

	async #readConfiguration(url: Readonly<URL>): Promise<Configuration> {
		const bridge = this.#bridge;
		const content = await bridge.read(url);
		if (content === null) throw new ReferenceError();
		const object = JSON.parse(content);
		return Configuration.import(object, "configuration");
	}

	async #readChangelog(url: Readonly<URL>): Promise<ChangelogEntry[]> {
		const bridge = this.#bridge;
		const content = await bridge.read(url);
		if (content === null) throw new ReferenceError();
		const object = JSON.parse(content);
		return ArrayOf<ChangelogEntry, ChangelogEntryScheme>(ChangelogEntry).import(object, "changelog");
	}

	async run(): Promise<void> {
		const configuration = await this.#readConfiguration(new URL("../data/feed-configuration.json", baseURI));
		const { platforms, urlProxy } = configuration;
		const serviceSettings = new SettingsService(new Map(platforms.filter(platform => platform.status === "connected").map(platform => [platform.name, true])));
		const main = await body.getElementAsync(HTMLElement, "main");
		const activities = new DataTable(this.#bridge, new URL("../data/activities", baseURI), Activity);
		const footer = await body.getElementAsync(HTMLElement, "footer");
		const changelog = await this.#readChangelog(new URL("../data/feed-changelog.json", baseURI));
		const serviceChangelog = new ChangelogService(changelog);

		MetadataInjector.inject({
			type: "Person",
			name: "eccs0103",
			webpage: new URL("https://eccs0103.github.io"),
			preview: new URL("../icons/circuit-transparent.gif", baseURI),
			associations: platforms
				.map(platform => platform.webpage)
				.filter(webpage => webpage !== null)
				.map(webpage => new URL(webpage)),
			job: "Software engineer",
			description: "Webpage of the person known by the nickname eccs0103.",
		});

		await HeaderRenderer.launch(body, serviceSettings, platforms);
		await ActivitiesRenderer.launch(main, new URL(urlProxy), activities, configuration);
		await FooterRenderer.launch(footer);
		await ChangelogRenderer.launch(body, serviceChangelog);

		void ProfileCollector.launch();
		void BatteryCollector.launch();
		void WebVitalsCollector.launch();
		void EngagementCollector.launch();
		void InteractionCollector.launch();
		void ErrorCollector.launch();
	}

	async catch(error: Error): Promise<void> {
		console.error(error);
	}
}
//#endregion

await WebpageController.launch();
