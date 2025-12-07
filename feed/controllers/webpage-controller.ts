"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { ActivityRenderer } from "../view/activity-renderer.js";
import { ArrayCursor } from "../services/array-cursor.js";
import { DatabaseContext } from "../services/database-context.js";

//#region Webpage controller
class WebpageController extends Controller {
	async run(): Promise<void> {

		const mainFeedContainer = await document.getElementAsync(HTMLElement, "main#feed-container");
		const spanFooterYear = await document.getElementAsync(HTMLSpanElement, "span#footer-year");

		const context = new DatabaseContext();
		await context.setup();

		const renderer = new ActivityRenderer(mainFeedContainer);
		const cursor = new ArrayCursor(context.activities);

		let limit = 21;
		while (cursor.inRange) {
			if (limit <= 0) break;
			renderer.render(cursor);
			limit--;
		}

		spanFooterYear.textContent = `${new Date().getFullYear()}`;
	}
}
//#endregion

await WebpageController.launch();
