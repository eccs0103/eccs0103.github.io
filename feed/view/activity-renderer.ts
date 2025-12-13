"use strict";

import "adaptive-extender/web";
import { Timespan } from "adaptive-extender/web";
import { Activity, GitHubActivity, GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubPushActivity, GitHubWatchActivity, SpotifyLikeActivity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";
import { TextExpert } from "../services/text-expert.js";
import { GitHubSummaryExpert, type LinkerFunction, type PrinterFunction } from "../services/github-summary-expert.js";

//#region Activity renderer
export class ActivityRenderer {
	#itemContainer: HTMLElement;
	#icons: Map<string, URL>;
	#gap: Timespan;

	constructor(itemContainer: HTMLElement, icons: Map<string, URL>, gap: Timespan) {
		this.#itemContainer = itemContainer;
		this.#icons = icons;
		this.#gap = gap;
	}

	static #newActivity(itemContainer: HTMLElement, icons: Map<string, URL>, activity: Activity): HTMLElement {
		const divActivity = itemContainer.appendChild(document.createElement("div"));
		divActivity.classList.add("activity", "layer", "rounded", "with-padding", "with-gap");

		const urlIcon = icons.get(activity.platform);
		if (urlIcon !== undefined) {
			const imgIcon = divActivity.appendChild(document.createElement("img"));
			imgIcon.src = urlIcon.toString();
			imgIcon.alt = activity.platform;
			imgIcon.classList.add("icon");
		}

		const timeTimestamp = divActivity.appendChild(document.createElement("time"));
		timeTimestamp.dateTime = activity.timestamp.toISOString();
		timeTimestamp.textContent = TextExpert.formatTime(activity.timestamp);
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

	static #renderGitHubPushActivity(container: HTMLElement, activity: GitHubPushActivity, count: number): void {
		container.appendChild(document.createTextNode("Published "));
		container.appendChild(ActivityRenderer.#newLink(`${count} update${TextExpert.getPluralSuffix(count)}`, `${activity.url}/commit/${activity.sha}`));
		container.appendChild(document.createTextNode(" to the source code of "));
		container.appendChild(ActivityRenderer.#newLink(activity.repository, activity.url));
		container.appendChild(document.createTextNode("."));
	}

	static #renderGitHubWatchActivity(container: HTMLElement, activity: GitHubWatchActivity): void {
		container.appendChild(document.createTextNode("Discovered and bookmarked the "));
		container.appendChild(ActivityRenderer.#newLink(activity.repository, activity.url));
		container.appendChild(document.createTextNode(" open-source project."));
	}

	static #renderGitHubCreateTagActivity(container: HTMLElement, activity: GitHubCreateTagActivity): void {
		container.appendChild(document.createTextNode("Released version "));
		container.appendChild(ActivityRenderer.#newLink(activity.name, `${activity.url}/releases/tag/${activity.name}`));
		container.appendChild(document.createTextNode(" for the "));
		container.appendChild(ActivityRenderer.#newLink(activity.repository, activity.url));
		container.appendChild(document.createTextNode(" product."));
	}

	static #renderGitHubCreateBranchActivity(container: HTMLElement, activity: GitHubCreateBranchActivity): void {
		container.appendChild(document.createTextNode("Started working on a new feature \""));
		container.appendChild(ActivityRenderer.#newLink(`${activity.name}`, `${activity.url}/tree/${activity.name}`));
		container.appendChild(document.createTextNode("\" in "));
		container.appendChild(ActivityRenderer.#newLink(activity.repository, activity.url));
		container.appendChild(document.createTextNode("."));
	}

	static #renderGitHubCreateRepositoryActivity(container: HTMLElement, activity: GitHubCreateRepositoryActivity): void {
		container.appendChild(document.createTextNode("Initiated a new repository named "));
		container.appendChild(ActivityRenderer.#newLink(activity.name, activity.url));
		container.appendChild(document.createTextNode("."));
	}

	static #renderGitHubActivity(container: HTMLElement, activity: GitHubActivity): void {
		if (activity instanceof GitHubPushActivity) return ActivityRenderer.#renderGitHubPushActivity(container, activity, 1);
		if (activity instanceof GitHubWatchActivity) return ActivityRenderer.#renderGitHubWatchActivity(container, activity);
		if (activity instanceof GitHubCreateTagActivity) return ActivityRenderer.#renderGitHubCreateTagActivity(container, activity);
		if (activity instanceof GitHubCreateBranchActivity) return ActivityRenderer.#renderGitHubCreateBranchActivity(container, activity);
		if (activity instanceof GitHubCreateRepositoryActivity) return ActivityRenderer.#renderGitHubCreateRepositoryActivity(container, activity);
	}

	#renderGitHubSingle(activity: GitHubActivity): void {
		const itemContainer = ActivityRenderer.#newActivity(this.#itemContainer, this.#icons, activity);
		ActivityRenderer.#renderGitHubActivity(itemContainer, activity);
	}

	#print(container: HTMLElement, strings: TemplateStringsArray, ...values: any[]): void {
		strings.forEach((string, index) => {
			container.appendChild(document.createTextNode(string));
			if (index >= values.length) return;
			const value = values[index];
			if (value instanceof Node) {
				container.appendChild(value);
				return;
			}
			container.appendChild(document.createTextNode(String(value)));
			return;
		});
	}

	#renderCollectionSummary(container: HTMLElement, activities: GitHubActivity[]): void {
		const expert = new GitHubSummaryExpert(activities);
		const linker: LinkerFunction = ActivityRenderer.#newLink.bind(ActivityRenderer);
		const context = expert.build(linker);
		const template = expert.choose();
		const printer: PrinterFunction = this.#print.bind(this, container);
		template(printer, context);
	}

	#renderGitHubCollection(activities: GitHubActivity[]): void {
		const itemContainer = ActivityRenderer.#newActivity(this.#itemContainer, this.#icons, activities[0]);

		const details = itemContainer.appendChild(document.createElement("details"));
		details.classList.add("github-collection");
		details.open = true;

		const summary = details.appendChild(document.createElement("summary"));

		this.#renderCollectionSummary(summary, activities);

		const ulContent = details.appendChild(document.createElement("ul"));
		ulContent.classList.add("collection-content");

		for (let index = 0; index < activities.length; index++) {
			const activity = activities[index];
			const liActivity = ulContent.appendChild(document.createElement("li"));

			if (!(activity instanceof GitHubPushActivity)) {
				ActivityRenderer.#renderGitHubActivity(liActivity, activity);
				continue;
			}

			let count = 1;
			while (index + 1 < activities.length) {
				const current = activities[index + 1];
				if (!(current instanceof GitHubPushActivity)) break;
				if (current.repository !== activity.repository) break;
				count++;
				index++;
			}
			ActivityRenderer.#renderGitHubPushActivity(liActivity, activity, count);
		}
	}

	#renderGitHubContent(cursor: ArrayCursor<Activity>): void {
		const buffer: GitHubActivity[] = [];
		const gap = this.#gap;
		let current = cursor.current as GitHubActivity;
		while (true) {
			buffer.push(current);
			cursor.index++;
			if (!cursor.inRange) break;
			const next = cursor.current;
			if (!(next instanceof GitHubActivity)) break;
			const difference = Timespan.fromValue(current.timestamp.valueOf() - next.timestamp.valueOf());
			if (difference.valueOf() > gap.valueOf()) break;
			current = next;
		}

		if (buffer.length > 1) return this.#renderGitHubCollection(buffer);
		return this.#renderGitHubSingle(buffer[0]);
	}

	#renderSpotifyLikeActivity(cursor: ArrayCursor<Activity>): void {
		const activity = cursor.current as SpotifyLikeActivity;
		const itemContainer = ActivityRenderer.#newActivity(this.#itemContainer, this.#icons, activity);
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

		cursor.index++;
	}

	render(cursor: ArrayCursor<Activity>): void {
		const activity = cursor.current;

		if (activity instanceof GitHubActivity) {
			this.#renderGitHubContent(cursor);
			return;
		}

		if (activity instanceof SpotifyLikeActivity) {
			this.#renderSpotifyLikeActivity(cursor);
			return;
		}

		cursor.index++;
	}
}
//#endregion
