"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { ActivityRenderer } from "../view/activity-renderer.js";
import database from "../data/activity.json";
import { Activity, GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubPushActivity, GitHubWatchActivity, SpotifyLikeActivity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";

//#region Main controller
class MainController extends Controller {
	async run(): Promise<void> {
		const mainFeedContainer = await document.getElementAsync(HTMLElement, "main#feed-container");
		const spanFooterYear = await document.getElementAsync(HTMLSpanElement, "span#footer-year");

		const renderer = new ActivityRenderer(mainFeedContainer);
		const name = "activity";
		const activities = Object.freeze(Array.import(database, name).map((item, index) => {
			return Activity.import(item, `${name}[${index}]`);
		}));
		const cursor = new ArrayCursor(activities);

		let limit = 21;
		while (cursor.inRange) {
			if (limit <= 0) break;

			const activity = cursor.target;
			if (activity instanceof GitHubPushActivity) {
				let mark = cursor.index;
				while (cursor.inRange) {
					const next = cursor.target;
					if (!(next instanceof GitHubPushActivity)) break;
					if (activity.repository !== next.repository) break;
					cursor.index++;
				}
				renderer.renderPush(activity, cursor.index - mark);
				cursor.index--;
			} else if (activity instanceof GitHubWatchActivity) {
				renderer.renderWatch(activity);
			} else if (activity instanceof GitHubCreateTagActivity) {
				renderer.renderCreateTag(activity);
			} else if (activity instanceof GitHubCreateBranchActivity) {
				renderer.renderCreateBranch(activity);
			} else if (activity instanceof GitHubCreateRepositoryActivity) {
				renderer.renderCreateRepository(activity);
			} else if (activity instanceof SpotifyLikeActivity) {
				renderer.renderSpotify(activity);
			}

			limit--;
			cursor.index++;
		}

		spanFooterYear.textContent = String(new Date().getFullYear());
	}
}
//#endregion

await MainController.launch();
