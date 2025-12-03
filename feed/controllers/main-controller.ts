"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { Activity, GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubPushActivity, GitHubWatchActivity, SpotifyLikeActivity } from "../models/activity.js";
import database from "../data/activity.json";
import { ArrayCursor } from "../services/array-cursor.js";
import githubIcon from "../../resources/icons/github.svg";
import spotifyIcon from "../../resources/icons/spotify.svg";

const services: Map<string, string> = new Map([
	["GitHub", githubIcon],
	["Spotify", spotifyIcon],
]);

//#region Main controller
class MainController extends Controller {
	static #addGitHubPushActivity(itemContainer: HTMLElement, activity: GitHubPushActivity, cursor: ArrayCursor<Activity>): void {
		let begin = cursor.index;
		while (cursor.inRange) {
			const next = cursor.target;
			if (!(next instanceof GitHubPushActivity)) break;
			if (activity.repository !== next.repository) break;
			cursor.index++;
		}
		itemContainer.textContent = `Pushed ${cursor.index - begin} times to the ${activity.repository} repository.`;
		cursor.index--;
	}

	static #addGitHubWatchActivity(itemContainer: HTMLElement, activity: GitHubWatchActivity): void {
		itemContainer.textContent = `Started following the ${activity.repository} repository.`;
	}

	static #addGitHubCreateTagActivity(itemContainer: HTMLElement, activity: GitHubCreateTagActivity): void {
		itemContainer.textContent = `Created tag ${activity.name} in repository ${activity.repository}.`;
	}

	static #addGitHubCreateBranchActivity(itemContainer: HTMLElement, activity: GitHubCreateBranchActivity): void {
		itemContainer.textContent = `Created branch ${activity.name} in repository ${activity.repository}.`;
	}

	static #addGitHubCreateRepositoryActivity(itemContainer: HTMLElement, activity: GitHubCreateRepositoryActivity): void {
		itemContainer.textContent = `Created repository '${activity.name}'.`;
	}

	static #addSpotifyLikeActivity(itemContainer: HTMLElement, activity: SpotifyLikeActivity): void {
		itemContainer.classList.add("layer", "rounded", "with-padding", "flex", "alt-center", "with-gap");

		const img = itemContainer.appendChild(document.createElement("img"));
		img.src = activity.imageUrl;
		img.alt = activity.trackName;
		img.classList.add("rounded");
		img.style.width = "calc(3 * var(--size-standart))";

		const infoDiv = itemContainer.appendChild(document.createElement("div"));
		infoDiv.classList.add("flex", "column");

		const titleSpan = infoDiv.appendChild(document.createElement("h4"));
		titleSpan.textContent = activity.trackName;
		titleSpan.style.fontWeight = "bold";

		const artistSpan = infoDiv.appendChild(document.createElement("span"));
		artistSpan.textContent = activity.artistName;
		artistSpan.classList.add("description");

		const link = infoDiv.appendChild(document.createElement("a"));
		link.href = activity.url;
		link.target = "_blank";
		link.textContent = "Listen on Spotify ↗";
		link.style.fontSize = "0.9em";
	}

	static #addActivity(itemContainer: HTMLElement, activity: Activity, cursor: ArrayCursor<Activity>): void {
		const divPost = itemContainer.appendChild(document.createElement("div"));
		divPost.classList.add("post", "layer", "rounded", "with-padding", "alt-center", "with-gap");

		const imgIcon = divPost.appendChild(document.createElement("img"));
		imgIcon.src = ReferenceError.suppress(services.get(activity.platform));
		imgIcon.alt = activity.platform;
		imgIcon.classList.add("icon");

		const timeTimestamp = divPost.appendChild(document.createElement("time"));
		timeTimestamp.dateTime = activity.timestamp.toISOString();
		timeTimestamp.textContent = activity.timestamp.toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" });
		timeTimestamp.classList.add("timestamp");

		const divContent = divPost.appendChild(document.createElement("div"));
		divContent.classList.add("content", "flex", "with-gap");
		if (activity instanceof GitHubPushActivity) this.#addGitHubPushActivity(divContent, activity, cursor);
		if (activity instanceof GitHubWatchActivity) this.#addGitHubWatchActivity(divContent, activity);
		if (activity instanceof GitHubCreateTagActivity) this.#addGitHubCreateTagActivity(divContent, activity);
		if (activity instanceof GitHubCreateBranchActivity) this.#addGitHubCreateBranchActivity(divContent, activity);
		if (activity instanceof GitHubCreateRepositoryActivity) this.#addGitHubCreateRepositoryActivity(divContent, activity);
		if (activity instanceof SpotifyLikeActivity) this.#addSpotifyLikeActivity(divContent, activity);
	}

	async run(): Promise<void> {
		const mainFeedContainer = await document.getElementAsync(HTMLElement, "main#feed-container");
		const spanFooterYear = await document.getElementAsync(HTMLSpanElement, "span#footer-year");

		const name = "activity";
		const activities = Object.freeze(Array.import(database, name).map((item, index) => {
			return Activity.import(item, `${name}[${index}]`);
		}));
		const cursor = new ArrayCursor(activities);

		let limit = 7;
		while (cursor.inRange) {
			if (limit <= 0) break;
			MainController.#addActivity(mainFeedContainer, cursor.target, cursor);
			limit--;
			cursor.index++;
		}

		spanFooterYear.textContent = String(new Date().getFullYear());
	}
}
//#endregion

await MainController.launch();
