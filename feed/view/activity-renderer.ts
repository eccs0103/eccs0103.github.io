"use strict";

import "adaptive-extender/web";
import { Timespan } from "adaptive-extender/web";
import { Activity, GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubPushActivity, GitHubWatchActivity, SpotifyLikeActivity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";
import urlGithubIcon from "../../resources/icons/github.svg?url";
import urlSpotifyIcon from "../../resources/icons/spotify.svg?url";

//#region Activity renderer
export class ActivityRenderer {
	static #icons: Map<string, string> = new Map([
		["GitHub", urlGithubIcon],
		["Spotify", urlSpotifyIcon]
	]);
	#itemContainer: HTMLElement;

	constructor(itemContainer: HTMLElement) {
		this.#itemContainer = itemContainer;
	}

	static #getPluralSuffix(count: number): string {
		if (count > 1) return "s";
		return String.empty;
	}

	static #formatTime(timestamp: Date): string {
		const span = Timespan.fromValue(Date.now() - timestamp.valueOf());
		if (span.days > 3) return timestamp.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
		if (span.days > 0) return `${span.days} day${ActivityRenderer.#getPluralSuffix(span.days)} ago`;
		if (span.hours > 0) return `${span.hours} hour${ActivityRenderer.#getPluralSuffix(span.hours)} ago`;
		if (span.minutes > 0) return `${span.minutes} min${ActivityRenderer.#getPluralSuffix(span.minutes)} ago`;
		return "Just now";
	}

	static #newActivity(itemContainer: HTMLElement, activity: Activity): HTMLElement {
		const divActivity = itemContainer.appendChild(document.createElement("div"));
		divActivity.classList.add("activity", "layer", "rounded", "with-padding", "with-gap");

		const imgIcon = divActivity.appendChild(document.createElement("img"));
		imgIcon.src = ReferenceError.suppress(ActivityRenderer.#icons.get(activity.platform));
		imgIcon.alt = activity.platform;
		imgIcon.classList.add("icon");

		const timeTimestamp = divActivity.appendChild(document.createElement("time"));
		timeTimestamp.dateTime = activity.timestamp.toISOString();
		timeTimestamp.textContent = ActivityRenderer.#formatTime(activity.timestamp);
		timeTimestamp.classList.add("activity-time");

		const divContent = divActivity.appendChild(document.createElement("div"));
		divContent.classList.add("content");

		return divContent;
	}

	static #newLink(text: string, url: string): HTMLAnchorElement {
		const aLink = document.createElement("a");
		aLink.href = url;
		aLink.textContent = text;
		aLink.target = "_blank";
		aLink.rel = "noopener noreferrer";
		return aLink;
	}

	render(cursor: ArrayCursor<Activity>): void {
		const activity = cursor.current;

		if (activity instanceof GitHubPushActivity) {
			this.#renderPush(cursor);
		} else if (activity instanceof GitHubWatchActivity) {
			this.#renderWatch(cursor);
		} else if (activity instanceof GitHubCreateTagActivity) {
			this.#renderCreateTag(cursor);
		} else if (activity instanceof GitHubCreateBranchActivity) {
			this.#renderCreateBranch(cursor);
		} else if (activity instanceof GitHubCreateRepositoryActivity) {
			this.#renderCreateRepository(cursor);
		} else if (activity instanceof SpotifyLikeActivity) {
			this.#renderSpotify(cursor);
		} else {
			cursor.advance();
		}
	}

	#renderPush(cursor: ArrayCursor<Activity>): void {
		const activity = cursor.current as GitHubPushActivity;
		let count = 0;
		while (cursor.inRange) {
			const current = cursor.current;
			if (!(current instanceof GitHubPushActivity)) break;
			if (current.repository !== activity.repository) break;
			count++;
			cursor.advance();
		}

		const itemContainer = ActivityRenderer.#newActivity(this.#itemContainer, activity);
		itemContainer.appendChild(document.createTextNode("Published "));
		itemContainer.appendChild(ActivityRenderer.#newLink(`${count} update${ActivityRenderer.#getPluralSuffix(count)}`, `${activity.url}/commit/${activity.sha}`));
		itemContainer.appendChild(document.createTextNode(" to the source code of "));
		itemContainer.appendChild(ActivityRenderer.#newLink(activity.repository, activity.url));
		itemContainer.appendChild(document.createTextNode("."));
	}

	#renderWatch(cursor: ArrayCursor<Activity>): void {
		const activity = cursor.current as GitHubWatchActivity;

		const itemContainer = ActivityRenderer.#newActivity(this.#itemContainer, activity);
		itemContainer.appendChild(document.createTextNode("Discovered and bookmarked the "));
		itemContainer.appendChild(ActivityRenderer.#newLink(activity.repository, activity.url));
		itemContainer.appendChild(document.createTextNode(" open-source project."));

		cursor.advance();
	}

	#renderCreateTag(cursor: ArrayCursor<Activity>): void {
		const activity = cursor.current as GitHubCreateTagActivity;

		const itemContainer = ActivityRenderer.#newActivity(this.#itemContainer, activity);
		itemContainer.appendChild(document.createTextNode("Released version "));
		itemContainer.appendChild(ActivityRenderer.#newLink(activity.name, `${activity.url}/releases/tag/${activity.name}`));
		itemContainer.appendChild(document.createTextNode(" for the "));
		itemContainer.appendChild(ActivityRenderer.#newLink(activity.repository, activity.url));
		itemContainer.appendChild(document.createTextNode(" product."));

		cursor.advance();
	}

	#renderCreateBranch(cursor: ArrayCursor<Activity>): void {
		const activity = cursor.current as GitHubCreateBranchActivity;

		const itemContainer = ActivityRenderer.#newActivity(this.#itemContainer, activity);
		itemContainer.appendChild(document.createTextNode("Started working on a new feature \""));
		itemContainer.appendChild(ActivityRenderer.#newLink(`${activity.name}`, `${activity.url}/tree/${activity.name}`));
		itemContainer.appendChild(document.createTextNode("\" in "));
		itemContainer.appendChild(ActivityRenderer.#newLink(activity.repository, activity.url));
		itemContainer.appendChild(document.createTextNode("."));

		cursor.advance();
	}

	#renderCreateRepository(cursor: ArrayCursor<Activity>): void {
		const activity = cursor.current as GitHubCreateRepositoryActivity;

		const itemContainer = ActivityRenderer.#newActivity(this.#itemContainer, activity);
		itemContainer.appendChild(document.createTextNode("Initiated a new repository named "));
		itemContainer.appendChild(ActivityRenderer.#newLink(activity.name, activity.url));
		itemContainer.appendChild(document.createTextNode("."));

		cursor.advance();
	}

	#renderSpotify(cursor: ArrayCursor<Activity>): void {
		const activity = cursor.current as SpotifyLikeActivity;
		const itemContainer = ActivityRenderer.#newActivity(this.#itemContainer, activity);
		itemContainer.classList.add("flex", "column", "with-gap");

		const spanAction = itemContainer.appendChild(document.createElement("span"));
		spanAction.textContent = "Added to music collection";

		const divEmbed = itemContainer.appendChild(document.createElement("div"));
		divEmbed.classList.add("flex", "with-gap");

		if (activity.cover !== null) {
			const imgCover = divEmbed.appendChild(document.createElement("img"));
			imgCover.src = activity.cover;
			imgCover.alt = activity.cover;
			imgCover.classList.add("rounded", "spotify-cover");
		}

		const divInformation = divEmbed.appendChild(document.createElement("div"));
		divInformation.classList.add("flex", "column");

		const strongTitle = divInformation.appendChild(document.createElement("strong"));
		strongTitle.textContent = activity.title;

		const spanArtist = divInformation.appendChild(document.createElement("span"));
		spanArtist.textContent = activity.artists.join(", ");
		spanArtist.classList.add("description");
		spanArtist.style.fontSize = "0.9em";

		const aReferrer = divInformation.appendChild(ActivityRenderer.#newLink("Listen on Spotify ↗", activity.url));
		aReferrer.classList.add("spotify-link", "with-block-padding");

		cursor.advance();
	}
}
//#endregion
