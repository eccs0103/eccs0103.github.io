"use strict";

import "adaptive-extender/web";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { SoundCloudActivity, SoundCloudLikeActivity, SoundCloudUploadActivity } from "../models/activity.js";
import { ActivityBuilder, DOMBuilder } from "./view-builders.js";

//#region SoundCloud render strategy
export class SoundCloudRenderStrategy implements ActivityRenderStrategy<SoundCloudActivity> {
	#renderTrack(itemContainer: HTMLElement, activity: SoundCloudActivity, message: string): void {
		const { title, publisher, artwork, url } = activity;

		itemContainer.appendChild(DOMBuilder.newTextbox(message));

		const divWrapper = itemContainer.appendChild(document.createElement("div"));
		divWrapper.classList.add("flex", "with-gap");

		if (artwork !== null) {
			const imgArtwork = divWrapper.appendChild(DOMBuilder.newImage(new URL(artwork), `'${title}' artwork`));
			imgArtwork.classList.add("rounded", "soundcloud-cover");
		}

		const divInformation = divWrapper.appendChild(document.createElement("div"));
		divInformation.classList.add("flex", "column");

		const strongHeader = divInformation.appendChild(document.createElement("strong"));
		strongHeader.textContent = title;

		divInformation.appendChild(DOMBuilder.newDescription(publisher));

		const aLink = divInformation.appendChild(DOMBuilder.newLink(new URL(url), { text: "Listen on SoundCloud" }));
		aLink.classList.add("with-block-padding", "font-smaller-3");

		ActivityBuilder.newExternalIcon(aLink);
	}

	#renderSingle(itemContainer: HTMLElement, activity: SoundCloudActivity): void {
		if (activity instanceof SoundCloudUploadActivity) return this.#renderTrack(itemContainer, activity, "Published a new track");
		if (activity instanceof SoundCloudLikeActivity) return this.#renderTrack(itemContainer, activity, "Added to music collection");
	}

	render(itemContainer: HTMLElement, buffer: readonly SoundCloudActivity[]): void {
		itemContainer.classList.add("flex", "column", "with-gap");

		for (const activity of buffer) {
			this.#renderSingle(itemContainer, activity);
		}
	}
}
//#endregion
