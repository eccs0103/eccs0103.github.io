"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { GitHubActivity } from "../models/user-activity";
import database from "../data/activity.json";

//#region Main controller
class MainController extends Controller {
	static #addActivityLog(container: HTMLElement, activity: GitHubActivity): void {
		const date = new Date(activity.timestamp).toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" });

		const divActivityLog = container.appendChild(document.createElement("div"));
		divActivityLog.classList.add("layer", "rounded", "with-padding");

		const timeActivityDate = divActivityLog.appendChild(document.createElement("time"));
		timeActivityDate.dateTime = date;
		timeActivityDate.style.fontSize = "small";
		timeActivityDate.style.justifySelf = "end";

		const aActivityLink = timeActivityDate.appendChild(document.createElement("a"));
		aActivityLink.href = activity.url;
		aActivityLink.textContent = `${date}`;

		const spanActivityDescription = divActivityLog.appendChild(document.createElement("span"));
		spanActivityDescription.textContent = activity.description;
	}

	async run(): Promise<void> {
		const mainFeedContainer = await document.getElementAsync(HTMLElement, "main#feed-container");
		const spanFooterYear = await document.getElementAsync(HTMLSpanElement, "span#footer-year");

		const name = "activity";
		const activities = Array.import(database, name).map((item, index) => {
			return GitHubActivity.import(item, `${name}[${index}]`);
		});
		let limit = 5;
		for (const activity of activities) {
			if (limit <= 0) break;
			MainController.#addActivityLog(mainFeedContainer, activity);
			limit--;
		}

		spanFooterYear.textContent = String(new Date().getFullYear());
	}
}
//#endregion

await MainController.launch();
