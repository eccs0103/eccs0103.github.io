"use strict";

import "adaptive-extender/web";
import { DOMBuilder } from "./view-builders.js";
import { SteamAchievementActivity, SteamActivity } from "../models/activity.js";
import { type ActivityRenderStrategy } from "./activities-renderer.js";

//#region SteamRenderStrategy
export class SteamRenderStrategy implements ActivityRenderStrategy {
	#renderAchievement(itemContainer: HTMLElement, activity: SteamAchievementActivity): void {
		const { game, title, description, url, icon } = activity;

		const divWrapper = itemContainer.appendChild(document.createElement("div"));
		divWrapper.classList.add("flex", "with-gap", "alt-center");

		if (icon !== null) {
			const imgIcon = divWrapper.appendChild(document.createElement("img"));
			imgIcon.src = icon;
			imgIcon.alt = `'${title}' icon`;
			imgIcon.classList.add("rounded", "steam-icon");
		}

		const divInformation = divWrapper.appendChild(document.createElement("div"));
		divInformation.classList.add("flex", "column");

		const spanHeader = divInformation.appendChild(document.createElement("span"));
		spanHeader.appendChild(DOMBuilder.newText("Earned \""));
		spanHeader.appendChild(DOMBuilder.newLink(title, url));
		spanHeader.appendChild(DOMBuilder.newText(`\" in ${game}`));

		if (description !== null && !String.isWhitespace(description)) {
			const spanDescription = divInformation.appendChild(document.createElement("span"));
			spanDescription.textContent = description;
			spanDescription.classList.add("description");
		}
	}

	render(itemContainer: HTMLElement, buffer: readonly SteamActivity[]): void {
		itemContainer.classList.add("flex", "column", "with-gap");
		for (const activity of buffer) {
			if (activity instanceof SteamAchievementActivity) {
				this.#renderAchievement(itemContainer, activity);
				continue;
			}
		}
	}
}
//#endregion
