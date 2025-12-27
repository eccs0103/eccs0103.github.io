"use strict";

import "adaptive-extender/web";
import { Timespan } from "adaptive-extender/web";
import { Activity, GitHubActivity, GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubDeleteBranchActivity, GitHubDeleteTagActivity, GitHubPushActivity, GitHubReleaseActivity, GitHubWatchActivity, SpotifyLikeActivity, SteamAchievementActivity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";
import { TextExpert } from "../services/text-expert.js";
import { GitHubSummaryExpert, type LinkerFunction, type PrinterFunction } from "../services/github-summary-expert.js";
import { type Platform } from "../models/platform.js";

const { baseURI } = document;

//#region Activity renderer
export class ActivitiesRenderer {
	#itemContainer: HTMLElement;

	constructor(itemContainer: HTMLElement,) {
		this.#itemContainer = itemContainer;
	}

	static #newActivity(itemContainer: HTMLElement, platforms: Map<string, Platform>, activity: Activity): HTMLElement {
		const divActivity = itemContainer.appendChild(document.createElement("div"));
		divActivity.classList.add("activity", "layer", "rounded", "with-padding", "with-gap");

		const platform = platforms.get(activity.platform);
		if (platform !== undefined) {
			const imgIcon = divActivity.appendChild(document.createElement("img"));
			imgIcon.src = String(new URL(platform.icon, new URL("../", baseURI)));
			imgIcon.alt = `${platform.name} logo`;
			imgIcon.classList.add("icon");

			const h3Platform = divActivity.appendChild(document.createElement("h4"));
			h3Platform.classList.add("platform");
			h3Platform.textContent = platform.name;
		}

		const timeTimestamp = divActivity.appendChild(document.createElement("time"));
		timeTimestamp.dateTime = activity.timestamp.toISOString();
		timeTimestamp.textContent = TextExpert.formatTime(activity.timestamp);
		timeTimestamp.classList.add("activity-time");

		const divContent = divActivity.appendChild(document.createElement("div"));
		divContent.classList.add("content");

		return divContent;
	}

	static #newText(text: string): Text {
		return document.createTextNode(text);
	}

	static #newLink(text: string, url: string): HTMLAnchorElement;
	static #newLink(text: string, url: string, disabled: boolean): HTMLAnchorElement;
	static #newLink(text: string, url: string, disabled: boolean = false): HTMLAnchorElement {
		const aLink = document.createElement("a");
		aLink.href = url;
		aLink.textContent = text;
		aLink.target = "_blank";
		aLink.rel = "noopener noreferrer";
		aLink.inert = disabled;
		return aLink;
	}

	static #renderGitHubPushActivity(container: HTMLElement, activity: GitHubPushActivity, count: number): void {
		const { url, sha, repository } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Published "));
		container.appendChild(ActivitiesRenderer.#newLink(`${count} update${TextExpert.getPluralSuffix(count)}`, `${url}/commit/${sha}`));
		container.appendChild(ActivitiesRenderer.#newText(" to the source code of "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubReleaseActivity(container: HTMLElement, activity: GitHubReleaseActivity): void {
		const { isPrerelease, title, url, repository } = activity;
		container.appendChild(ActivitiesRenderer.#newText(isPrerelease ? "Rolled out a test version " : "Shipped update "));
		container.appendChild(ActivitiesRenderer.#newLink(title, url));
		container.appendChild(ActivitiesRenderer.#newText(" for "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubWatchActivity(container: HTMLElement, activity: GitHubWatchActivity): void {
		const { repository, url } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Discovered and bookmarked the "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText(" open-source project."));
	}

	static #renderGitHubCreateTagActivity(container: HTMLElement, activity: GitHubCreateTagActivity): void {
		const { name, url, repository } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Marked a new milestone "));
		container.appendChild(ActivitiesRenderer.#newLink(name, `${url}/releases/tag/${name}`));
		container.appendChild(ActivitiesRenderer.#newText(" in "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText(" history."));
	}

	static #renderGitHubCreateBranchActivity(container: HTMLElement, activity: GitHubCreateBranchActivity): void {
		const { name, url, repository } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Started working on a new feature \""));
		container.appendChild(ActivitiesRenderer.#newLink(name, `${url}/tree/${name}`));
		container.appendChild(ActivitiesRenderer.#newText("\" in "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubCreateRepositoryActivity(container: HTMLElement, activity: GitHubCreateRepositoryActivity): void {
		const { name, url } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Initiated a new repository named "));
		container.appendChild(ActivitiesRenderer.#newLink(name, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubDeleteTagActivity(container: HTMLElement, activity: GitHubDeleteTagActivity): void {
		const { name, repository, url } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Unpublished version "));
		container.appendChild(ActivitiesRenderer.#newLink(name, `${url}/releases/tag/${name}`, true));
		container.appendChild(ActivitiesRenderer.#newText(" from "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubDeleteBranchActivity(container: HTMLElement, activity: GitHubDeleteBranchActivity): void {
		const { name, url, repository } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Removed the "));
		container.appendChild(ActivitiesRenderer.#newLink(name, `${url}/tree/${name}`, true));
		container.appendChild(ActivitiesRenderer.#newText(" draft from "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubActivity(container: HTMLElement, activity: GitHubActivity): void {
		if (activity instanceof GitHubPushActivity) return ActivitiesRenderer.#renderGitHubPushActivity(container, activity, 1);
		if (activity instanceof GitHubReleaseActivity) return ActivitiesRenderer.#renderGitHubReleaseActivity(container, activity);
		if (activity instanceof GitHubWatchActivity) return ActivitiesRenderer.#renderGitHubWatchActivity(container, activity);
		if (activity instanceof GitHubCreateTagActivity) return ActivitiesRenderer.#renderGitHubCreateTagActivity(container, activity);
		if (activity instanceof GitHubCreateBranchActivity) return ActivitiesRenderer.#renderGitHubCreateBranchActivity(container, activity);
		if (activity instanceof GitHubCreateRepositoryActivity) return ActivitiesRenderer.#renderGitHubCreateRepositoryActivity(container, activity);
		if (activity instanceof GitHubDeleteBranchActivity) return ActivitiesRenderer.#renderGitHubDeleteBranchActivity(container, activity);
		if (activity instanceof GitHubDeleteTagActivity) return ActivitiesRenderer.#renderGitHubDeleteTagActivity(container, activity);
	}

	static #renderSpotifyLikeActivity(itemContainer: HTMLElement, activity: SpotifyLikeActivity): void {
		const { title, cover } = activity;

		const spanAction = itemContainer.appendChild(document.createElement("span"));
		spanAction.textContent = "Added to music collection";

		const divEmbed = itemContainer.appendChild(document.createElement("div"));
		divEmbed.classList.add("flex", "with-gap");

		if (cover !== null) {
			const imgCover = divEmbed.appendChild(document.createElement("img"));
			imgCover.src = cover;
			imgCover.alt = `'${title}' cover`;
			imgCover.classList.add("rounded", "spotify-cover");
		}

		const divInformation = divEmbed.appendChild(document.createElement("div"));
		divInformation.classList.add("flex", "column");

		const strongTitle = divInformation.appendChild(document.createElement("strong"));
		strongTitle.textContent = title;

		const spanArtist = divInformation.appendChild(document.createElement("span"));
		spanArtist.textContent = activity.artists.join(", ");
		spanArtist.classList.add("description");
		spanArtist.style.fontSize = "0.9em";

		const aReferrer = divInformation.appendChild(ActivitiesRenderer.#newLink("Listen on Spotify ↗", activity.url));
		aReferrer.classList.add("spotify-link", "with-block-padding");
	}

	static #renderSteamAchievementActivity(container: HTMLElement, activity: SteamAchievementActivity): void {
		const { game, title, description, url, icon } = activity;

		const divWrapper = container.appendChild(document.createElement("div"));
		divWrapper.classList.add("flex", "with-gap", "alt-center"); 

		if (icon !== null) {
			const imgIcon = divWrapper.appendChild(document.createElement("img"));
			imgIcon.src = icon;
			imgIcon.alt = `'${title}' icon`;
			imgIcon.classList.add("rounded", "steam-icon");
		}

		const divText = divWrapper.appendChild(document.createElement("div"));
		divText.classList.add("flex", "column");

		const spanHeader = divText.appendChild(document.createElement("span"));
		spanHeader.appendChild(ActivitiesRenderer.#newText("Earned \""));
		spanHeader.appendChild(ActivitiesRenderer.#newLink(title, url));
		spanHeader.appendChild(ActivitiesRenderer.#newText(`\" in ${game}`));

		if (description !== null && !String.isWhitespace(description)) {
			const spanDescription = divText.appendChild(document.createElement("span"));
			spanDescription.textContent = description;
			spanDescription.classList.add("description");
		}
	}

	#renderGitHubSingle(activity: GitHubActivity, platforms: Map<string, Platform>): void {
		const itemContainer = ActivitiesRenderer.#newActivity(this.#itemContainer, platforms, activity);
		ActivitiesRenderer.#renderGitHubActivity(itemContainer, activity);
	}

	#print(container: HTMLElement, strings: TemplateStringsArray, ...values: any[]): void {
		strings.forEach((string, index) => {
			container.appendChild(ActivitiesRenderer.#newText(string));
			if (index >= values.length) return;
			const value = values[index];
			if (value instanceof Node) {
				container.appendChild(value);
				return;
			}
			container.appendChild(ActivitiesRenderer.#newText(String(value)));
			return;
		});
	}

	#renderCollectionSummary(container: HTMLElement, activities: GitHubActivity[]): void {
		const expert = new GitHubSummaryExpert(activities);
		const linker: LinkerFunction = ActivitiesRenderer.#newLink.bind(ActivitiesRenderer);
		const context = expert.build(linker);
		const template = expert.choose();
		const printer: PrinterFunction = this.#print.bind(this, container);
		template(printer, context);
	}

	#renderGitHubCollection(activities: GitHubActivity[], platforms: Map<string, Platform>): void {
		const itemContainer = ActivitiesRenderer.#newActivity(this.#itemContainer, platforms, activities[0]);

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
				ActivitiesRenderer.#renderGitHubActivity(liActivity, activity);
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
			ActivitiesRenderer.#renderGitHubPushActivity(liActivity, activity, count);
		}
	}

	#renderGitHubContent(cursor: ArrayCursor<Activity>, platforms: Map<string, Platform>, gap: Readonly<Timespan>): void {
		const buffer: GitHubActivity[] = [];

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

		if (buffer.length > 1) return this.#renderGitHubCollection(buffer, platforms);
		return this.#renderGitHubSingle(buffer[0], platforms);
	}

	#renderSpotifyContent(cursor: ArrayCursor<Activity>, platforms: Map<string, Platform>): void {
		const activity = cursor.current as SpotifyLikeActivity;
		const itemContainer = ActivitiesRenderer.#newActivity(this.#itemContainer, platforms, activity);
		itemContainer.classList.add("flex", "column", "with-gap");
		ActivitiesRenderer.#renderSpotifyLikeActivity(itemContainer, activity);

		cursor.index++;
	}

	#renderSteamContent(cursor: ArrayCursor<Activity>, platforms: Map<string, Platform>): void {
		const activity = cursor.current as SteamAchievementActivity;
		const itemContainer = ActivitiesRenderer.#newActivity(this.#itemContainer, platforms, activity);
		itemContainer.classList.add("flex", "column", "with-gap");
		ActivitiesRenderer.#renderSteamAchievementActivity(itemContainer, activity);

		cursor.index++;
	}

	async render(cursor: ArrayCursor<Activity>, platforms: readonly Platform[], gap: Readonly<Timespan>): Promise<void> {
		const activity = cursor.current;
		const mapping = new Map(platforms.map(platform => [platform.name, platform]));

		if (activity instanceof GitHubActivity) {
			this.#renderGitHubContent(cursor, mapping, gap);
			return;
		}

		if (activity instanceof SpotifyLikeActivity) {
			this.#renderSpotifyContent(cursor, mapping);
			return;
		}

		if (activity instanceof SteamAchievementActivity) {
			this.#renderSteamContent(cursor, mapping);
			return;
		}

		cursor.index++;
	}
}
//#endregion
