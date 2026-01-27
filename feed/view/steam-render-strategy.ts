"use strict";

import "adaptive-extender/web";
import { DOMBuilder } from "./view-builders.js";
import { SteamAchievementActivity, SteamActivity, SteamScreenshotActivity } from "../models/activity.js";
import { type ActivityRenderStrategy } from "./activities-renderer.js";

//#region Steam render strategy
export class SteamRenderStrategy implements ActivityRenderStrategy<SteamActivity> {
	#renderAchievement(itemContainer: HTMLElement, activity: SteamAchievementActivity): void {
		const { game, webpage, title, description, url, icon } = activity;

		const divWrapper = itemContainer.appendChild(document.createElement("div"));
		divWrapper.classList.add("flex", "with-gap", "alt-center");

		if (icon !== null) {
			const imgIcon = divWrapper.appendChild(DOMBuilder.newImage(new URL(icon), `'${title}' icon`));
			imgIcon.classList.add("rounded", "steam-icon");
		}

		const divInformation = divWrapper.appendChild(document.createElement("div"));
		divInformation.classList.add("flex", "column");

		const spanHeader = divInformation.appendChild(document.createElement("span"));
		spanHeader.appendChild(DOMBuilder.newText("Earned \""));
		spanHeader.appendChild(DOMBuilder.newLink(title, new URL(url)));
		spanHeader.appendChild(DOMBuilder.newText(`" in `));
		spanHeader.appendChild(DOMBuilder.newLink(game, new URL(webpage)));

		if (description !== null && !String.isWhitespace(description)) {
			const spanDescription = divInformation.appendChild(document.createElement("span"));
			spanDescription.textContent = description;
			spanDescription.classList.add("description");
		}
	}

	#renderGallery(itemContainer: HTMLElement, screenshots: readonly SteamScreenshotActivity[]): void {
		const { game, webpage } = screenshots[0];

		const divGroup = itemContainer.appendChild(document.createElement("div"));
		divGroup.classList.add("steam-group", "flex", "column", "with-gap");

		const divHeader = divGroup.appendChild(document.createElement("div"));
		divHeader.classList.add("group-header");

		divHeader.appendChild(DOMBuilder.newText("Uploaded "));
		const countText = screenshots.length === 1 ? "a screenshot" : `${screenshots.length} screenshots`;
		const spanCount = divHeader.appendChild(document.createElement("span"));
		spanCount.textContent = countText;
		divHeader.appendChild(DOMBuilder.newText(" from "));
		divHeader.appendChild(DOMBuilder.newLink(game, new URL(webpage)));

		const divGrid = divGroup.appendChild(document.createElement("div"));
		divGrid.classList.add("steam-gallery");
		divGrid.setAttribute("data-layout", screenshots.length <= 4 ? screenshots.length.toString() : "many");

		for (const shot of screenshots) {
			const aWrapper = divGrid.appendChild(DOMBuilder.newLink("", new URL(shot.url)));
			aWrapper.classList.add("screenshot-card");

			const img = aWrapper.appendChild(DOMBuilder.newImage(new URL(shot.url), shot.title ?? `Screenshot from ${game}`));
			img.classList.add("steam-screenshot");

			if (shot.title) {
				const divOverlay = aWrapper.appendChild(document.createElement("div"));
				divOverlay.classList.add("caption-overlay");
				const spanTitle = divOverlay.appendChild(document.createElement("span"));
				spanTitle.textContent = shot.title;
			}
		}
	}

	#renderSingle(itemContainer: HTMLElement, activity: SteamActivity): void {
		if (activity instanceof SteamAchievementActivity) return this.#renderAchievement(itemContainer, activity);
		if (activity instanceof SteamScreenshotActivity) return this.#renderGallery(itemContainer, [activity]);
	}

	#renderCollection(itemContainer: HTMLElement, activities: readonly SteamActivity[]): void {
		itemContainer.classList.add("flex", "column", "with-gap");

		for (let index = 0; index < activities.length; index++) {
			const activity = activities[index];

			if (activity instanceof SteamAchievementActivity) {
				this.#renderSingle(itemContainer, activity);
				continue;
			}

			if (activity instanceof SteamScreenshotActivity) {
				const group: SteamScreenshotActivity[] = [activity];
				while (index + 1 < activities.length) {
					const next = activities[index + 1];
					if (!(next instanceof SteamScreenshotActivity)) break;
					if (next.game !== activity.game) break;

					group.push(next);
					index++;
				}
				this.#renderGallery(itemContainer, group);
			}
		}
	}

	render(itemContainer: HTMLElement, buffer: readonly SteamActivity[]): void {
		if (buffer.length > 1) return this.#renderCollection(itemContainer, buffer);
		return this.#renderSingle(itemContainer, buffer[0]);
	}
}
//#endregion
