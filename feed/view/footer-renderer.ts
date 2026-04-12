"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";

//#region Footer renderer
export class FooterRenderer extends Controller<[HTMLElement]> {
	async run(footerContainer: HTMLElement): Promise<void> {
		const spanFooterYear = await footerContainer.getElementAsync(HTMLSpanElement, "span#footer-year");
		spanFooterYear.textContent = String(new Date().getFullYear());
	}
}
//#endregion
