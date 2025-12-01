"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { Activity, GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubPushActivity, GitHubWatchActivity } from "../models/activity.js";
import database from "../data/activity.json";
import { ArrayCursor } from "../services/array-cursor.js";

//#region Main controller
class MainController extends Controller {
	async run(): Promise<void> {
		const mainFeedContainer = await document.getElementAsync(HTMLElement, "main#feed-container");
		const spanFooterYear = await document.getElementAsync(HTMLSpanElement, "span#footer-year");

		const name = "activity";
		const activities = Object.freeze(Array.import(database, name).map((item, index) => {
			return Activity.import(item, `${name}[${index}]`);
		}));
		const cursor = new ArrayCursor(activities);

		let limit = 5;
		while (cursor.inRange) {
			if (limit <= 0) break;
			const activity = cursor.target;

			const divActivityLog = mainFeedContainer.appendChild(document.createElement("div"));
			divActivityLog.classList.add("layer", "rounded", "with-padding");

			const timeActivityDate = divActivityLog.appendChild(document.createElement("time"));
			timeActivityDate.dateTime = activity.timestamp.toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" });
			timeActivityDate.style.fontSize = "small";
			timeActivityDate.style.justifySelf = "end";
			timeActivityDate.textContent = timeActivityDate.dateTime;

			const spanActivityDescription = divActivityLog.appendChild(document.createElement("span"));
			if (activity instanceof GitHubPushActivity) {
				let begin = cursor.index;
				while (cursor.inRange) {
					const next = cursor.target;
					if (!(next instanceof GitHubPushActivity)) break;
					if (activity.repository !== next.repository) break;
					cursor.index++;
				}
				spanActivityDescription.textContent = `Pushed ${cursor.index - begin} times to the ${activity.repository} repository.`;
				cursor.index--;
			}
			if (activity instanceof GitHubWatchActivity) {
				spanActivityDescription.textContent = `Started following the ${activity.repository} repository.`;
			}
			if (activity instanceof GitHubCreateTagActivity) {
				spanActivityDescription.textContent = `Created tag ${activity.name} in repository ${activity.repository}.`;
			}
			if (activity instanceof GitHubCreateBranchActivity) {
				spanActivityDescription.textContent = `Created branch ${activity.name} in repository ${activity.repository}.`;
			}
			if (activity instanceof GitHubCreateRepositoryActivity) {
				spanActivityDescription.textContent = `Created repository '${activity.name}'.`;
			}
			limit--;
			cursor.index++;
		}

		spanFooterYear.textContent = String(new Date().getFullYear());
	}
}
//#endregion

await MainController.launch();
