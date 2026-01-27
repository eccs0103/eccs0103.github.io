"use strict";

import "adaptive-extender/web";
import { type Platform } from "../models/configuration";
import { DOMBuilder } from "./view-builders.js";

const { baseURI } = document;

//#region Header renderer
export class HeaderRenderer {
	#headerContainer: HTMLElement;

	constructor(headerContainer: HTMLElement) {
		this.#headerContainer = headerContainer;
	}

	static #newActivity(itemContainer: HTMLElement, platform: Platform): HTMLElement {
		const aSocialMedia = itemContainer.appendChild(document.createElement("a"));
		aSocialMedia.href = String(platform.webpage);
		aSocialMedia.target = "_blank";
		aSocialMedia.rel = "noopener noreferrer";
		aSocialMedia.role = "button";
		aSocialMedia.classList.add("flex", "alt-center");

		const spanIcon = aSocialMedia.appendChild(document.createElement("span"));
		spanIcon.classList.add("icon");
		spanIcon.style.setProperty("--url", `url("${new URL(platform.icon, new URL("../", baseURI))}")`);
		if (!platform.isActive) spanIcon.inert = true;

		const spanTitle = aSocialMedia.appendChild(DOMBuilder.newTextbox(platform.name));
		spanTitle.classList.add("with-inline-padding");

		return aSocialMedia;
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
