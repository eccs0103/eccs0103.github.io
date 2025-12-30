"use strict";

import "adaptive-extender/web";
import { Controller, Timespan } from "adaptive-extender/web";
import { ActivitiesRenderer } from "../view/activities-renderer.js";
import { ClientDataTable } from "../services/client-data-table.js";
import { Activity } from "../models/activity.js";
import { Platform } from "../models/platform.js";
import { FooterRenderer } from "../view/footer-renderer.js";
import { MetadataInjector } from "../../environment/services/metadata-injector.js";
import { HeaderRenderer } from "../view/header-renderer.js";

const { baseURI, body } = document;

//#region Webpage controller
class WebpageController extends Controller {
	async run(): Promise<void> {
		const activities = new ClientDataTable(new URL("../data/activities.json", baseURI), Activity);
		const platforms = new ClientDataTable(new URL("../data/platforms.json", baseURI), Platform);
		await activities.load();
		await platforms.load();

		const header = await body.getElementAsync(HTMLElement, "header");
		const rendererHeader = new HeaderRenderer(header);
		await rendererHeader.render(platforms);

		const main = await body.getElementAsync(HTMLElement, "main");
		const rendererActivies = new ActivitiesRenderer(main);
		await rendererActivies.render(activities, platforms);

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
