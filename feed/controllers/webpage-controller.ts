"use strict";

import "adaptive-extender/web";
import { ArrayOf, Controller } from "adaptive-extender/web";
import { ActivitiesRenderer } from "../view/activities-renderer.js";
import { ClientBridge } from "../services/client-bridge.js";
import { DataTable } from "../services/data-table.js";
import { Activity } from "../models/activity.js";
import { FooterRenderer } from "../view/footer-renderer.js";
import { HeaderRenderer } from "../view/header-renderer.js";
import { Configuration } from "../models/configuration.js";
import { ChangelogEntry, type ChangelogEntryScheme } from "../models/changelog.js";
import { type Bridge } from "../services/bridge.js";
import { SettingsService } from "../services/settings-service.js";
import { ChangelogService } from "../services/changelog-service.js";
import { ChangelogRenderer } from "../view/changelog-renderer.js";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";
import { MetadataController } from "./metadata-controller.js";

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
		const { platforms } = configuration;
		const settings = new SettingsService(new Map(platforms.filter(platform => platform.status === "connected").map(platform => [platform.name, true])));
		const main = await body.getElementAsync(HTMLElement, "main");
		const activities = new DataTable(this.#bridge, new URL("../data/activities", baseURI), Activity);
		const footer = await body.getElementAsync(HTMLElement, "footer");
		const dataChangelog = await this.#readChangelog(new URL("../data/feed-changelog.json", baseURI));
		const changelog = new ChangelogService(dataChangelog);

		const promiseHeader = HeaderRenderer.launch(body, settings, platforms);
		const promiseActivities = ActivitiesRenderer.launch(main, new URL(configuration.urlProxy), activities, configuration);
		const promiseFooter = FooterRenderer.launch(footer);
		const promiseChangelog = ChangelogRenderer.launch(body, changelog);
		const promiseMetadata = MetadataController.launch(platforms);
		const promiseAnalytics = AnalyticsController.launch();

		await Promise.all([promiseHeader, promiseActivities, promiseFooter, promiseChangelog, promiseMetadata, promiseAnalytics]);
	}

	async catch(error: Error): Promise<void> {
		console.error(error);
	}
}
//#endregion

await WebpageController.launch();
