"use strict";

import "adaptive-extender/web";
import { type Platform } from "../models/configuration.js";
import { type Activity } from "../models/activity.js";
import { TextExpert } from "../services/text-expert.js";

const { baseURI } = document;

//#region DOM builder
export class DOMBuilder {
	static newText(text: string): Text {
		return document.createTextNode(text);
	}

	static newDescription(text: string): HTMLElement {
		const spanDescription = document.createElement("span");
		spanDescription.classList.add("description");
		spanDescription.textContent = text;

		return spanDescription;
	}

	static newLink(text: string, url: URL): HTMLAnchorElement;
	static newLink(text: string, url: URL, disabled: boolean): HTMLAnchorElement;
	static newLink(text: string, url: URL, disabled: boolean = false): HTMLAnchorElement {
		const aLink = document.createElement("a");
		aLink.href = String(url);
		aLink.textContent = text;
		aLink.target = "_blank";
		aLink.rel = "noopener noreferrer";
		aLink.inert = disabled;
		return aLink;
	}

	static print(itemContainer: HTMLElement, strings: TemplateStringsArray, ...values: any[]): void {
		strings.forEach((string, index) => {
			itemContainer.appendChild(DOMBuilder.newText(string));
			if (index >= values.length) return;
			const value = values[index];
			if (value instanceof Node) {
				itemContainer.appendChild(value);
				return;
			}
			itemContainer.appendChild(DOMBuilder.newText(String(value)));
		});
	}
}
//#endregion
//#region Activity builder
export class ActivityBuilder {
	static newSentinel(itemContainer: HTMLElement): HTMLElement {
		const itemSentinel = itemContainer.appendChild(document.createElement("div"));
		itemSentinel.classList.add("sentinel");

		return itemSentinel;
	}

	static newContainer(itemParent: HTMLElement, platforms: Map<string, Platform>, activity: Activity, observer: IntersectionObserver): HTMLElement {
		const itemContainer = itemParent.insertBefore(document.createElement("div"), itemParent.lastElementChild);
		itemContainer.classList.add("activity", "layer", "rounded", "with-padding", "with-gap", "awaiting-reveal");
		observer.observe(itemContainer);

		const platform = platforms.get(activity.platform);
		if (platform !== undefined) {
			const spanIcon = itemContainer.appendChild(document.createElement("span"));
			spanIcon.style.setProperty("--url", `url(${new URL(platform.icon, new URL("../", baseURI))})`);
			spanIcon.classList.add("icon");

			const h4Title = itemContainer.appendChild(document.createElement("h4"));
			h4Title.classList.add("platform");
			h4Title.textContent = platform.name;
		}

		const timeElement = itemContainer.appendChild(document.createElement("time"));
		timeElement.dateTime = activity.timestamp.toISOString();
		timeElement.textContent = TextExpert.formatTime(activity.timestamp);
		timeElement.classList.add("activity-time");

		const divContent = itemContainer.appendChild(document.createElement("div"));
		divContent.classList.add("content");

		return divContent;
	}
}
//#endregion
