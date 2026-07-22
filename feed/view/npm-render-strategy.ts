"use strict";

import "adaptive-extender/web";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { NpmActivity, NpmPublishActivity } from "../models/activity.js";
import { ActivityBuilder, DOMBuilder } from "./view-builders.js";

//#region Npm render strategy
export class NpmRenderStrategy implements ActivityRenderStrategy<NpmActivity> {
	#renderPublish(itemContainer: HTMLElement, activity: NpmPublishActivity): void {
		const { package: name, version, description, url } = activity;

		const divWrapper = itemContainer.appendChild(document.createElement("div"));
		divWrapper.classList.add("flex", "column");

		const strongHeader = divWrapper.appendChild(document.createElement("strong"));
		strongHeader.textContent = `${name}@${version}`;

		if (description !== null) divWrapper.appendChild(DOMBuilder.newDescription(description));

		const aLink = divWrapper.appendChild(DOMBuilder.newLink(new URL(url), { text: "View on npm" }));
		aLink.classList.add("with-block-padding", "font-smaller-3");

		ActivityBuilder.newExternalIcon(aLink);
	}

	#renderSingle(itemContainer: HTMLElement, activity: NpmActivity): void {
		if (activity instanceof NpmPublishActivity) return this.#renderPublish(itemContainer, activity);
	}

	render(itemContainer: HTMLElement, buffer: readonly NpmActivity[]): void {
		itemContainer.classList.add("flex", "column", "with-gap");

		itemContainer.appendChild(DOMBuilder.newTextbox("Published a new package version"));

		for (const activity of buffer) {
			this.#renderSingle(itemContainer, activity);
		}
	}
}
//#endregion
