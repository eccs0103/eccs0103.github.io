"use strict";

import "adaptive-extender/web";
import { Controller, Timespan } from "adaptive-extender/web";
import { ActivitiesRenderer } from "../view/activities-renderer.js";
import { ClientBridge } from "../services/client-bridge.js";
import { DataTable } from "../services/data-table.js";
import { Activity } from "../models/activity.js";
import { FooterRenderer } from "../view/footer-renderer.js";
import { MetadataInjector } from "../../environment/services/metadata-injector.js";
import { HeaderRenderer } from "../view/header-renderer.js";
import { Configuration } from "../models/configuration.js";
import { type Bridge } from "../services/bridge.js";
import { SettingsService } from "../services/settings-service.js";

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

	async run(): Promise<void> {
		const configuration = await this.#readConfiguration(new URL("../data/feed-configuration.json", baseURI));

		const bridge = this.#bridge;
		const activities = new DataTable(bridge, new URL("../data/activities", baseURI), Activity);

		const { platforms } = configuration;
		const settings = new SettingsService(platforms.filter(platform => platform.status === "connected").map(platform => platform.name));
		const rendererHeader = new HeaderRenderer(body, settings);
		await rendererHeader.render(platforms);

		const main = await body.getElementAsync(HTMLElement, "main");
		const rendererActivies = new ActivitiesRenderer(main);
		await rendererActivies.render(activities, configuration, { gap: Timespan.fromComponents(36, 0, 0) });

		const footer = await body.getElementAsync(HTMLElement, "footer");
		const rendererFooter = new FooterRenderer(footer);
		await rendererFooter.render();

		MetadataInjector.inject({
			type: "Person",
			name: "eccs0103",
			webpage: new URL("https://eccs0103.github.io"),
			preview: new URL("../icons/circuit-transparent.gif", baseURI),
			associations: configuration.platforms
				.map(platform => platform.webpage)
				.filter(webpage => webpage !== null)
				.map(webpage => new URL(webpage)),
			job: "Software engineer",
			description: "Webpage of the person known by the nickname eccs0103.",
		});
	}

	async catch(error: Error): Promise<void> {
		console.error(error);
	}
}
//#endregion

await WebpageController.launch();
