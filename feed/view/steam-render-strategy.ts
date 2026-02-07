"use strict";

import "adaptive-extender/web";
import { DOMBuilder } from "./view-builders.js";
import { SteamAchievementActivity, SteamActivity, SteamScreenshotActivity } from "../models/activity.js";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { TextExpert } from "../services/text-expert.js";

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
		spanHeader.appendChild(DOMBuilder.newText("\" in "));
		spanHeader.appendChild(DOMBuilder.newLink(game, new URL(webpage)));

		if (description !== null && !String.isWhitespace(description)) {
			divInformation.appendChild(DOMBuilder.newDescription(description));
		}
	}

	#renderScreenshotNode(itemContainer: HTMLElement, activity: SteamScreenshotActivity): void {
		const { title, url, game } = activity;

		const aLink = itemContainer.appendChild(DOMBuilder.newLink(String.empty, new URL(url)));
		aLink.classList.add("screenshot-card");

		const imgScreenshot = aLink.appendChild(DOMBuilder.newImage(new URL(url), title ?? `Screenshot from ${game}`));
		imgScreenshot.classList.add("steam-screenshot");

		if (title !== null) {
			const divOverlay = aLink.appendChild(document.createElement("div"));
				divOverlay.classList.add("caption-overlay", "font-smaller-3");

			divOverlay.appendChild(DOMBuilder.newTextbox(title));
		}
	}

	#renderGallery(itemContainer: HTMLElement, screenshots: readonly SteamScreenshotActivity[]): void {
		const { game, webpage } = screenshots[0];
		const count = screenshots.length;

		const divGroup = itemContainer.appendChild(document.createElement("div"));
		divGroup.classList.add("steam-group", "flex", "column", "with-gap");

		const divHeader = divGroup.appendChild(document.createElement("div"));
		divHeader.classList.add("group-header");

		divHeader.appendChild(DOMBuilder.newText("Uploaded "));
		divHeader.appendChild(DOMBuilder.newTextbox(`${TextExpert.getIndefiniteCardinal(count)} screenshot${TextExpert.getPluralSuffix(count)}`));
		divHeader.appendChild(DOMBuilder.newText(" from "));
		divHeader.appendChild(DOMBuilder.newLink(game, new URL(webpage)));

		const divGallery = divGroup.appendChild(document.createElement("div"));
		divGallery.classList.add("steam-gallery");
		divGallery.setAttribute("data-layout", count <= 4 ? String(count) : "many");

		for (const screenshot of screenshots) {
			this.#renderScreenshotNode(divGallery, screenshot);
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
				this.#renderAchievement(itemContainer, activity);
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
