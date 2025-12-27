"use strict";

import "adaptive-extender/web";

//#region Footer renderer
export class FooterRenderer {
	#footerContainer: HTMLElement;

	constructor(footerContainer: HTMLElement) {
		this.#footerContainer = footerContainer;
	}

	async render(): Promise<void> {
		const footerContainer = this.#footerContainer;

		const spanFooterYear = await footerContainer.getElementAsync(HTMLSpanElement, "span#footer-year");
		spanFooterYear.textContent = String(new Date().getFullYear());
	}
}
//#endregion
