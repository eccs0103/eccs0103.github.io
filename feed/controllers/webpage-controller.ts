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

const { baseURI, body } = document;

//#region Webpage controller
class WebpageController extends Controller {
	async #readConfiguration(url: Readonly<URL>): Promise<Configuration> {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const object = await response.json();
		return Configuration.import(object, "configuration");
	}

	async run(): Promise<void> {
		const { platforms } = await this.#readConfiguration(new URL("../data/feed-configuration.json", baseURI));

		const bridge = new ClientBridge();
		const activities = new DataTable(bridge, new URL("../data/activities", baseURI), Activity);

		const header = await body.getElementAsync(HTMLElement, "header");
		const rendererHeader = new HeaderRenderer(header);
		await rendererHeader.render(platforms);

		const main = await body.getElementAsync(HTMLElement, "main");
		const rendererActivies = new ActivitiesRenderer(main);
		await rendererActivies.render(activities, platforms, { gap: Timespan.fromComponents(36, 0, 0) });

		const footer = await body.getElementAsync(HTMLElement, "footer");
		const rendererFooter = new FooterRenderer(footer);
		await rendererFooter.render();

		MetadataInjector.inject({
			type: "Person",
			name: "eccs0103",
			webpage: new URL("https://eccs0103.github.io"),
			preview: new URL("../icons/circuit-transparent.gif", baseURI),
			associations: platforms.map(platform => new URL(platform.webpage)),
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
