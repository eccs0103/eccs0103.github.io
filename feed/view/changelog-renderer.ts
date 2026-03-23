"use strict";

import "adaptive-extender/web";
import { ChangelogService } from "../services/changelog-service.js";

//#region Changelog renderer
export class ChangelogRenderer {
	#itemContainer: HTMLElement;

	constructor(itemContainer: HTMLElement) {
		this.#itemContainer = itemContainer;
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

		let index = 0;

		const buildContent = () => {
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
				spanMore.textContent = `and ${remaining} more update${remaining > 1 ? "s" : ""} before this`;

				const buttonLoadOlder = divFooter.appendChild(document.createElement("button"));
				buttonLoadOlder.type = "button";
				buttonLoadOlder.classList.add("with-inline-padding", "with-padding", "small-padding", "rounded", "depth");
				buttonLoadOlder.textContent = "Load older";
				buttonLoadOlder.addEventListener("click", () => {
					index++;
					buildContent();
				});
			}

			const buttonClose = divFooter.appendChild(document.createElement("button"));
			buttonClose.type = "button";
			buttonClose.classList.add("with-inline-padding", "with-padding", "small-padding", "rounded", "depth");
			buttonClose.textContent = "Got it";
			buttonClose.addEventListener("click", () => {
				dialog.close();
			});
		};

		buildContent();
		service.markAsSeen();
		dialog.showModal();
	}
}
//#endregion
