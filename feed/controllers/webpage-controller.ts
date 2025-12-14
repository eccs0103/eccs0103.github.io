"use strict";

import "adaptive-extender/web";
import { Controller, Timespan } from "adaptive-extender/web";
import { ActivitiesRenderer } from "../view/activities-renderer.js";
import { ArrayCursor } from "../services/array-cursor.js";
import { ClientDataTable } from "../services/client-data-table.js";
import { Activity } from "../models/activity.js";
import { Platform } from "../models/platform.js";
import { FooterRenderer } from "../view/footer-renderer.js";

const meta = import.meta;

//#region Webpage controller
class WebpageController extends Controller {
	async run(): Promise<void> {
		const urlActivities = new URL("../data/activities.json", meta.url);
		const urlPlatforms = new URL("../data/platforms.json", meta.url);
		const activities = new ClientDataTable(urlActivities, Activity);
		const platforms = new ClientDataTable(urlPlatforms, Platform);
		await activities.load();
		await platforms.load();
		const { body } = document;

		const main = await body.getElementAsync(HTMLElement, "main");
		const rendererActivies = new ActivitiesRenderer(main);
		const cursor = new ArrayCursor(activities);
		const gap = Timespan.fromComponents(24, 0, 0);
		let limit = 15;
		while (cursor.inRange) {
			if (limit <= 0) break;
			await rendererActivies.render(cursor, platforms, gap);
			limit--;
		}

		const footer = await body.getElementAsync(HTMLElement, "footer");
		const rendererFooter = new FooterRenderer(footer);
		await rendererFooter.render(platforms);
	}

	async catch(error: Error): Promise<void> {
		console.error(error);
	}
}
//#endregion

await WebpageController.launch();
