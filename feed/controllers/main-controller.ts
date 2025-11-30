"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { UserActivity } from "../models/user-activity";
import database from "../data/activity.json";

//#region Main controller
class MainController extends Controller {
	static addActivityLog(container: HTMLDivElement, activity: UserActivity): void {
		const date = new Date(activity.timestamp).toLocaleString();

		const divActivityLog = container.appendChild(document.createElement("div"));
		divActivityLog.classList.add("layer", "rounded", "with-padding");

		const timeActivityDate = divActivityLog.appendChild(document.createElement("time"));
		timeActivityDate.dateTime = date;

		const aActivityLink = timeActivityDate.appendChild(document.createElement("a"));
		aActivityLink.href = activity.url;
		aActivityLink.textContent = `${date}: `;

		const spanActivityDescription = divActivityLog.appendChild(document.createElement("span"));
		spanActivityDescription.textContent = activity.description;
	}

	async run(): Promise<void> {
		const divFeedContainer = await document.getElementAsync(HTMLDivElement, "div#feed-container");
		const spanFooterYear = await document.getElementAsync(HTMLSpanElement, "span#footer-year");

		const name = "activity";
		const activities = Array.import(database, name).map((item, index) => {
			return UserActivity.import(item, `${name}[${index}]`);
		});
		let limit = 5;
		for (const activity of activities) {
			if (limit <= 0) break;
			MainController.addActivityLog(divFeedContainer, activity);
			limit--;
		}

		spanFooterYear.textContent = String(new Date().getFullYear());
	}
}
//#endregion

await MainController.launch();
