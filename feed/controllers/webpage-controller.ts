"use strict";

import "adaptive-extender/web";
import { Controller, Timespan } from "adaptive-extender/web";
import { ActivityRenderer } from "../view/activity-renderer.js";
import { ArrayCursor } from "../services/array-cursor.js";
import { ClientDataTable } from "../services/client-data-table.js";
import { Activity } from "../models/activity.js";
import { Platform } from "../models/platform.js";

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

		const mainFeedContainer = await document.getElementAsync(HTMLElement, "main#feed-container");
		const spanFooterYear = await document.getElementAsync(HTMLSpanElement, "span#footer-year");
		const icons = new Map(platforms.map(platform => [platform.name, platform.icon]));
		const renderer = new ActivityRenderer(mainFeedContainer, icons, Timespan.fromComponents(24, 0, 0));
		const cursor = new ArrayCursor(activities);

		let limit = 15;
		while (cursor.inRange) {
			if (limit <= 0) break;
			renderer.render(cursor);
			limit--;
		}

		spanFooterYear.textContent = `${new Date().getFullYear()}`;
	}

	async catch(error: Error): Promise<void> {
		console.error(error);
	}
}
//#endregion

await WebpageController.launch();
