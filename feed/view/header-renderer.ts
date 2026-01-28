"use strict";

import "adaptive-extender/web";
import { type Platform } from "../models/configuration";
import { DOMBuilder } from "./view-builders.js";

const { baseURI } = document;

//#region Header renderer
export class HeaderRenderer {
	#itemContainer: HTMLElement;

	constructor(itemContainer: HTMLElement) {
		this.#itemContainer = itemContainer;
	}

	async render(platforms: readonly Platform[]): Promise<void> {
		const itemContainer = this.#itemContainer;

		const buttonConnectionsHubTrigger = await itemContainer.getElementAsync(HTMLButtonElement, "button#connections-hub-trigger");
		buttonConnectionsHubTrigger.addEventListener("click", (event) => {
			dialogConnectionsHub.showModal();
		});

		const dialogConnectionsHub = await itemContainer.getElementAsync(HTMLDialogElement, "dialog#connections-hub");
		dialogConnectionsHub.addEventListener("click", (event) => {
			if (event.target !== dialogConnectionsHub) return;
			dialogConnectionsHub.close();
		});
		for (const platform of platforms) {
			const { name, icon, webpage, status, note } = platform;

			const divConnectionRow = dialogConnectionsHub.appendChild(document.createElement("div"));
			divConnectionRow.dataset["status"] = status ?? "none";
			divConnectionRow.classList.add("connection-row", "with-padding", "with-inline-gap");

			const spanConnectionIcon = divConnectionRow.appendChild(DOMBuilder.newIcon(new URL(icon, new URL("../", baseURI))));
			spanConnectionIcon.classList.add("connection-icon");

			const strongConnectionName = divConnectionRow.appendChild(document.createElement("strong"));
			strongConnectionName.classList.add("connection-name");
			strongConnectionName.textContent = name;

			if (webpage !== null) {
				const aConnectionLink = divConnectionRow.appendChild(DOMBuilder.newLink("Open webpage", new URL(webpage)));
				aConnectionLink.classList.add("connection-link");
			}

			if (note !== null) {
				const spanConnectionNote = divConnectionRow.appendChild(DOMBuilder.newDescription(note));
				spanConnectionNote.classList.add("connection-note");
			}
		}
	}
}
//#endregion
