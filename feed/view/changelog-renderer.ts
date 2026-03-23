"use strict";

import "adaptive-extender/web";
import { type ChangelogEntry } from "../models/changelog.js";
import { type ChangelogService } from "../services/changelog-service.js";
import { TextExpert } from "../services/text-expert.js";

//#region Changelog renderer
export class ChangelogRenderer {
	#itemContainer: HTMLElement;

	constructor(itemContainer: HTMLElement) {
		this.#itemContainer = itemContainer;
	}

	#buildEntry(dialog: HTMLDialogElement, unseen: readonly ChangelogEntry[], index: number): void {
		dialog.innerHTML = "";

		const entry = unseen[index]!;
		const remaining = unseen.length - index - 1;

		const strongTitle = dialog.appendChild(document.createElement("strong"));
		strongTitle.classList.add("changelog-title");
		strongTitle.textContent = `Update · ${entry.date.toLocaleDateString()}`;

		const ulChanges = dialog.appendChild(document.createElement("ul"));
		ulChanges.classList.add("changelog-changes");
		for (const change of entry.changes) {
			const li = ulChanges.appendChild(document.createElement("li"));
			li.textContent = change;
		}

		const divFooter = dialog.appendChild(document.createElement("div"));
		divFooter.classList.add("changelog-footer", "flex", "alt-center", "with-gap");

		if (remaining > 0) {
			const spanMore = divFooter.appendChild(document.createElement("span"));
			spanMore.classList.add("font-smaller-2");
			spanMore.textContent = `and ${remaining} more update${TextExpert.getPluralSuffix(remaining)} before this`;

			const buttonLoadOlder = divFooter.appendChild(document.createElement("button"));
			buttonLoadOlder.type = "button";
			buttonLoadOlder.classList.add("with-inline-padding", "with-padding", "small-padding", "rounded", "layer");
			buttonLoadOlder.textContent = "Load older";
			buttonLoadOlder.addEventListener("click", (event) => {
				this.#buildEntry(dialog, unseen, index + 1);
			});
		}

		const buttonClose = divFooter.appendChild(document.createElement("button"));
		buttonClose.type = "button";
		buttonClose.classList.add("with-inline-padding", "with-padding", "small-padding", "rounded", "highlight-background");
		buttonClose.textContent = "Got it";
		buttonClose.addEventListener("click", (event) => {
			dialog.close();
		});
	}

	async render(service: ChangelogService): Promise<void> {
		// if (service.isFirstVisit) {
		// 	service.markAsSeen();
		// 	return;
		// }

		const { unseen } = service;
		if (unseen.length === 0) return;

		const dialog = await this.#itemContainer.getElementAsync(HTMLDialogElement, "dialog#changelog");
		dialog.addEventListener("click", (event) => {
			if (event.target !== dialog) return;
			dialog.close();
		});

		this.#buildEntry(dialog, unseen, 0);
		service.markAsSeen();
		dialog.showModal();
	}
}
//#endregion
