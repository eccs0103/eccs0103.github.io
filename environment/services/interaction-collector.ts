"use strict";

import "adaptive-extender/web";
import { OutboundClick } from "../models/outbound-click.js";
import { TextCopy } from "../models/text-copy.js";
import { Collector } from "./analytics-service.js";

//#region InteractionCollector
export class InteractionCollector extends Collector {
	collect(): void {
		document.addEventListener("click", this.#onClick.bind(this));
		document.addEventListener("copy", this.#onCopy.bind(this));
	}

	#onClick(event: MouseEvent): void {
		const anchor = event.composedPath().find((el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement);
		if (anchor === undefined) return;
		if (!anchor.href || anchor.target !== "_blank") return;
		this.dispatch("outbound_click", OutboundClick, new OutboundClick(anchor.href, (anchor.textContent ?? String.empty).trim()));
	}

	#onCopy(): void {
		const text = window.getSelection()?.toString().trim();
		if (!text) return;
		this.dispatch("text_copy", TextCopy, new TextCopy(text));
	}
}
//#endregion
