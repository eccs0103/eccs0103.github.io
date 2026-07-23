"use strict";

import "adaptive-extender/web";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { NpmActivity, NpmPublishActivity } from "../models/activity.js";
import { DOMBuilder } from "./view-builders.js";

//#region Npm render strategy
export class NpmRenderStrategy implements ActivityRenderStrategy<NpmActivity> {
	#renderVersion(itemContainer: HTMLElement, activity: NpmPublishActivity): void {
		const { version, description, url } = activity;

		const divVersion = itemContainer.appendChild(document.createElement("div"));
		divVersion.classList.add("flex", "column");

		const spanVersion = divVersion.appendChild(document.createElement("span"));
		spanVersion.textContent = version;

		if (description !== null) divVersion.appendChild(DOMBuilder.newDescription(description));

		const aLink = divVersion.appendChild(DOMBuilder.newLink(new URL(url), { text: "View on npm" }));
		aLink.classList.add("with-block-padding", "font-smaller-3");
	}

	#renderCollection(itemContainer: HTMLElement, activities: readonly NpmPublishActivity[]): void {
		const details = itemContainer.appendChild(document.createElement("details"));
		details.classList.add("npm-collection");
		details.open = true;

		const summary = details.appendChild(document.createElement("summary"));
		summary.textContent = "Published new package versions";

		const ulContent = details.appendChild(document.createElement("ul"));
		ulContent.classList.add("collection-content");

		for (let index = 0; index < activities.length; index++) {
			const activity = activities[index];
			const liItem = ulContent.appendChild(document.createElement("li"));

			const strongHeader = liItem.appendChild(document.createElement("strong"));
			strongHeader.textContent = activity.package;

			const divVersions = liItem.appendChild(document.createElement("div"));
			divVersions.classList.add("flex", "column", "with-gap");

			this.#renderVersion(divVersions, activity);
			while (index + 1 < activities.length && activities[index + 1].package === activity.package) {
				index++;
				this.#renderVersion(divVersions, activities[index]);
			}
		}
	}

	render(itemContainer: HTMLElement, buffer: readonly NpmActivity[]): void {
		const publishes: NpmPublishActivity[] = [];
		for (const activity of buffer) {
			if (activity instanceof NpmPublishActivity) publishes.push(activity);
		}

		this.#renderCollection(itemContainer, publishes);
	}
}
//#endregion
