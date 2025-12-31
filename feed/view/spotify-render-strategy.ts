"use strict";

import "adaptive-extender/web";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { SpotifyActivity, SpotifyLikeActivity } from "../models/activity.js";
import { DOMBuilder } from "./view-builders";

//#region Spotify render strategy
export class SpotifyRenderStrategy implements ActivityRenderStrategy {
	#renderLike(itemContainer: HTMLElement, activity: SpotifyLikeActivity): void {
		const { title, cover } = activity;

		const divWrapper = itemContainer.appendChild(document.createElement("div"));
		divWrapper.classList.add("flex", "with-gap");

		if (cover !== null) {
			const imgCover = divWrapper.appendChild(document.createElement("img"));
			imgCover.src = cover;
			imgCover.alt = `'${title}' cover`;
			imgCover.classList.add("rounded", "spotify-cover");
		}

		const divInformation = divWrapper.appendChild(document.createElement("div"));
		divInformation.classList.add("flex", "column");

		const strongHeader = divInformation.appendChild(document.createElement("strong"));
		strongHeader.textContent = title;

		const spanArtists = divInformation.appendChild(document.createElement("span"));
		spanArtists.textContent = activity.artists.join(", ");
		spanArtists.classList.add("description");
		spanArtists.style.fontSize = "0.9em";

		const aLink = divInformation.appendChild(DOMBuilder.newLink("Listen on Spotify ↗", activity.url));
		aLink.classList.add("spotify-link", "with-block-padding");
	}

	render(itemContainer: HTMLElement, buffer: readonly SpotifyActivity[]): void {
		itemContainer.classList.add("flex", "column", "with-gap");
		const spanLabel = itemContainer.appendChild(document.createElement("span"));
		spanLabel.textContent = "Added to music collection";

		for (const activity of buffer) {
			if (activity instanceof SpotifyLikeActivity) {
				this.#renderLike(itemContainer, activity);
				continue;
			}
		}
	}
}
//#endregion
