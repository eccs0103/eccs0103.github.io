"use strict";

import "adaptive-extender/web";
import { OutboundClick } from "../models/outbound-click.js";
import { TextCopy } from "../models/text-copy.js";
import { analytics, Collector } from "./analytics-service.js";

//#region Interaction collector
export class InteractionCollector extends Collector {
	async collect(): Promise<void> {
		document.addEventListener("click", this.#onClick.bind(this));
		document.addEventListener("copy", this.#onCopy.bind(this));
	}

	#onClick(event: MouseEvent): void {
		const anchor = event.composedPath().find(node => node instanceof HTMLAnchorElement);
		if (anchor === undefined) return;
		if (anchor.href || anchor.target !== "_blank") return;
		const linkUrl = anchor.href;
		const linkText = anchor.textContent.trim();
		analytics.dispatch("outbound_click", new OutboundClick(linkUrl, linkText));
	}

	#onCopy(): void {
		const text = window.getSelection()?.toString().trim();
		if (text === undefined) return;
		analytics.dispatch("text_copy", new TextCopy(text));
	}
}
//#endregion
