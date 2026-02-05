"use strict";

import "adaptive-extender/web";
import { type Platform } from "../models/configuration";
import { DOMBuilder } from "./view-builders.js";
import { ArchiveRepository } from "adaptive-extender/web";
import { Settings } from "../models/settings";

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

		const repository = new ArchiveRepository("Personal webpage\\Feed\\Settings", Settings, new Settings(platforms.filter(platform => platform.status === "connected").map(platform => platform.name)));
		const { preferences } = repository.content;
		const styleElement = document.head.appendChild(document.createElement("style"));
		for (const platform of platforms) {
			const { name, icon, webpage, status, note } = platform;

			const divConnectionRow = dialogConnectionsHub.appendChild(document.createElement("div"));
			divConnectionRow.dataset["status"] = status ?? "none";
			divConnectionRow.classList.add("connection-row", "with-padding", "with-inline-gap");

			if (status === "connected") {
				const inputPlatformToggle = divConnectionRow.appendChild(document.createElement("input"));
				inputPlatformToggle.type = "checkbox";
				inputPlatformToggle.checked = preferences.includes(name);
				inputPlatformToggle.id = `platform-toggle-${name.replace(/\s+/g, "-").toLowerCase()}`;
				inputPlatformToggle.dataset["platform"] = name;
				inputPlatformToggle.hidden = true;
				styleElement.textContent += `body:has(dialog#connections-hub input#${inputPlatformToggle.id}:not(:checked)) main div.activity[data-platform="${name}"] { display: none; }`;
				inputPlatformToggle.addEventListener("change", (event) => {
					if (inputPlatformToggle.checked) {
						if (!preferences.includes(name)) preferences.push(name);
					} else {
						const index = preferences.indexOf(name);
						if (index >= 0) preferences.splice(index, 1);
					}
					repository.save(200);
				});

				const labelPlatformFilter = divConnectionRow.appendChild(document.createElement("label"));
				labelPlatformFilter.htmlFor = inputPlatformToggle.id;
				labelPlatformFilter.classList.add("platform-toggle", "in-line", "toggle", "layer");
				labelPlatformFilter.role = "checkbox";
				labelPlatformFilter.title = `Toggle ${name}`;

				const spanKnob = labelPlatformFilter.appendChild(document.createElement("span"));
				spanKnob.classList.add("knob", "depth");
			}

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
