"use strict";

import "adaptive-extender/web";
import { type Platform } from "../models/platform.js";

const { baseURI } = document;

//#region Header renderer
export class HeaderRenderer {
	#headerContainer: HTMLElement;

	constructor(headerContainer: HTMLElement) {
		this.#headerContainer = headerContainer;
	}

	static #newActivity(itemContainer: HTMLElement, platform: Platform): HTMLElement {
		const addressSocialMedia = itemContainer.appendChild(document.createElement("address"));
		addressSocialMedia.classList.add("flex", "alt-center");

		const imgIcon = addressSocialMedia.appendChild(document.createElement("img"));
		imgIcon.src = String(new URL(platform.icon, new URL("../", baseURI)));
		imgIcon.alt = `${platform.name} logo`;
		imgIcon.classList.add("icon", "integrated");
		if (!platform.isActive) imgIcon.inert = true;

		const aLink = addressSocialMedia.appendChild(document.createElement("a"));
		aLink.href = String(platform.webpage);
		aLink.target = "_blank";
		aLink.rel = "noopener noreferrer";
		aLink.classList.add("with-inline-padding");
		aLink.textContent = platform.name;

		return addressSocialMedia;
	}

	async render(platforms: readonly Platform[]): Promise<void> {
		const headerContainer = this.#headerContainer;

		const divSocialMedia = await headerContainer.getElementAsync(HTMLDivElement, "div#social-media");
		for (const platform of platforms) {
			HeaderRenderer.#newActivity(divSocialMedia, platform);
		}
	}
}
//#endregion
