"use strict";

import "adaptive-extender/web";

import { OutboundClick, TextCopy } from "../models/analytics.js";

export class InteractionCollector {
	#emit: (name: string, params: object) => void;

	constructor(emit: (name: string, params: object) => void) {
		this.#emit = emit;
	}

	collect(): void {
		document.addEventListener("click", this.#onClick.bind(this));
		document.addEventListener("copy", this.#onCopy.bind(this));
	}

	#onClick(event: MouseEvent): void {
		const anchor = event.composedPath().find((el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement);
		if (anchor === undefined) return;
		if (!anchor.href || anchor.target !== "_blank") return;
		this.#emit("outbound_click", OutboundClick.export(new OutboundClick(anchor.href, anchor.textContent?.trim() ?? "")));
	}

	#onCopy(): void {
		const text = window.getSelection()?.toString().trim();
		if (!text) return;
		this.#emit("text_copy", TextCopy.export(new TextCopy(text)));
	}
}
