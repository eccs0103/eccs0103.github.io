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

	static newTextbox(text: string): HTMLElement {
		const spanDescription = document.createElement("span");
		spanDescription.textContent = text;

		return spanDescription;
	}

	static newDescription(text: string): HTMLElement {
		const spanDescription = document.createElement("span");
		spanDescription.classList.add("description");
		spanDescription.textContent = text;

		return spanDescription;
	}

	static newLink(text: string, url: Readonly<URL>): HTMLAnchorElement;
	static newLink(text: string, url: Readonly<URL>, disabled: boolean): HTMLAnchorElement;
	static newLink(text: string, url: Readonly<URL>, disabled: boolean = false): HTMLAnchorElement {
		const aLink = document.createElement("a");
		aLink.href = String(url);
		aLink.textContent = text;
		aLink.target = "_blank";
		aLink.rel = "noopener noreferrer";
		aLink.inert = disabled;
		return aLink;
	}

	static newIcon(url: Readonly<URL>): HTMLElement {
		const icon = document.createElement("span");
		icon.classList.add("icon");
		icon.style.setProperty("--url", `url("${url}")`);

		return icon;
	}

	static newImage(url: Readonly<URL>, text: string): HTMLImageElement {
		const img = document.createElement("img");
		img.src = String(url);
		img.alt = text;
		img.loading = "lazy";

		return img;
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
	static newIntro(itemContainer: HTMLElement, message: string): HTMLElement {
		const itemIntro = itemContainer.appendChild(DOMBuilder.newDescription(message));
		itemIntro.classList.add("intro", "small-font");

		return itemIntro;
	}

	static newWarning(itemContainer: HTMLElement): void {
		const span = itemContainer.appendChild(document.createElement("span"));
		span.classList.add("experimetnal-core", "warn", "small-font");

		span.appendChild(DOMBuilder.newText("This page operates on an "));
		span.appendChild(DOMBuilder.newLink("experimental core", new URL("https://github.com/eccs0103/adaptive-extender/commits/main/")));
		span.appendChild(DOMBuilder.newText(". Generated content may exhibit instability. Technical stabilization is in progress."));
	}

	static newSentinel(itemContainer: HTMLElement): HTMLElement {
		const itemSentinel = itemContainer.appendChild(document.createElement("div"));
		itemSentinel.classList.add("sentinel");

		return itemSentinel;
	}

	static newOutro(itemContainer: HTMLElement, itemChild: HTMLElement, message: string): HTMLElement {
		const itemOutro = DOMBuilder.newDescription(message);
		itemContainer.replaceChild(itemOutro, itemChild);
		itemOutro.classList.add("outro", "small-font");

		return itemOutro;
	}

	static newContainer(itemParent: HTMLElement, platforms: Map<string, Platform>, activity: Activity, observer: IntersectionObserver): HTMLElement {
		const itemContainer = itemParent.insertBefore(document.createElement("div"), itemParent.lastElementChild);
		itemContainer.classList.add("activity", "layer", "rounded", "with-padding", "with-gap", "awaiting-reveal");
		itemContainer.dataset["platform"] = activity.platform;
		observer.observe(itemContainer);

		const platform = platforms.get(activity.platform);
		if (platform !== undefined) {
			itemContainer.appendChild(DOMBuilder.newIcon(new URL(platform.icon, new URL("../", baseURI))));

			const h4Title = itemContainer.appendChild(document.createElement("h4"));
			h4Title.classList.add("platform");
			h4Title.textContent = platform.name;
		}

		const timeElement = itemContainer.appendChild(document.createElement("time"));
		timeElement.dateTime = activity.timestamp.toISOString();
		timeElement.title = activity.timestamp.toLocaleString();
		timeElement.textContent = TextExpert.formatTime(activity.timestamp);
		timeElement.classList.add("activity-time", "small-font");

		const divContent = itemContainer.appendChild(document.createElement("div"));
		divContent.classList.add("content");

		return divContent;
	}
}
//#endregion
