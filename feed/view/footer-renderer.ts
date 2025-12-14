"use strict";

import "adaptive-extender/web";
import { type Platform } from "../models/platform.js";

//#region Footer renderer
export class FooterRenderer {
	#footerContainer: HTMLElement;

	constructor(footerContainer: HTMLElement) {
		this.#footerContainer = footerContainer;
	}

	static #newActivity(itemContainer: HTMLElement, platform: Platform): HTMLElement {
		const addressSocialMedia = itemContainer.appendChild(document.createElement("address"));
		addressSocialMedia.classList.add("flex", "alt-center");

		const imgIcon = addressSocialMedia.appendChild(document.createElement("img"));
		imgIcon.src = String(platform.icon);
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
		const footerContainer = this.#footerContainer;

		const divSocialMedia = await footerContainer.getElementAsync(HTMLDivElement, "div#social-media");
		for (const platform of platforms) {
			FooterRenderer.#newActivity(divSocialMedia, platform);
		}

		const spanFooterYear = await footerContainer.getElementAsync(HTMLSpanElement, "span#footer-year");
		spanFooterYear.textContent = String(new Date().getFullYear());
	}
}
//#endregion
