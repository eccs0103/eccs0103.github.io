"use strict";

import "adaptive-extender/web";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { TelegramActivity, TelegramMediaPostActivity, TelegramTextPostActivity } from "../models/activity.js";
import { ActivityBuilder, DOMBuilder } from "./view-builders.js";

//#region Telegram render strategy
export class TelegramRenderStrategy implements ActivityRenderStrategy<TelegramActivity> {
	#urlProxy: URL;

	constructor(urlProxy: URL) {
		this.#urlProxy = urlProxy;
	}

	#buildMediaUrl(fileId: number, fileName: string): URL {
		const url = new URL(this.#urlProxy);
		url.searchParams.set("identifier", String(fileId));
		url.searchParams.set("filename", fileName);
		return url;
	}

	#renderText(itemContainer: HTMLElement, activity: TelegramTextPostActivity): void {
		const { text } = activity;

		const textbox = itemContainer.appendChild(DOMBuilder.newTextbox(text));
		textbox.classList.add("telegram-text");
	}

	#renderPhoto(itemContainer: HTMLElement, activity: TelegramMediaPostActivity): void {
		const { messageId, fileName, description } = activity;

		const figure = itemContainer.appendChild(document.createElement("figure"));
		figure.classList.add("telegram-media");

		const mediaUrl = this.#buildMediaUrl(messageId, fileName);
		const image = figure.appendChild(DOMBuilder.newImage(mediaUrl, description ?? "Telegram photo"));
		image.classList.add("telegram-photo");

		if (description !== null) {
			const itemDescription = figure.appendChild(DOMBuilder.newDescription(description))
			itemDescription.classList.add("telegram-caption");
		}
	}

	#renderAnimation(itemContainer: HTMLElement, activity: TelegramMediaPostActivity): void {
		const { messageId, fileName, description } = activity;

		const figure = itemContainer.appendChild(document.createElement("figure"));
		figure.classList.add("telegram-media");

		const mediaUrl = this.#buildMediaUrl(messageId, fileName);
		const loop = true;
		const muted = true;
		const controls = false;
		const autoplay = true;
		const playsInline = true;
		const video = figure.appendChild(DOMBuilder.newVideo(mediaUrl, { loop, muted, controls, autoplay, playsInline }));
		video.classList.add("telegram-gif");

		if (description !== null) {
			const itemDescription = figure.appendChild(DOMBuilder.newDescription(description));
			itemDescription.classList.add("telegram-caption");
		}
	}

	#renderVideo(itemContainer: HTMLElement, activity: TelegramMediaPostActivity): void {
		const { messageId, fileName, description } = activity;

		const figure = itemContainer.appendChild(document.createElement("figure"));
		figure.classList.add("telegram-media");

		const mediaUrl = this.#buildMediaUrl(messageId, fileName);
		const controls = true;
		const video = figure.appendChild(DOMBuilder.newVideo(mediaUrl, { controls }));
		video.classList.add("telegram-video");

		if (description !== null) {
			const itemDescription = figure.appendChild(DOMBuilder.newDescription(description));
			itemDescription.classList.add("telegram-caption");
		}
	}

	#renderAudio(itemContainer: HTMLElement, activity: TelegramMediaPostActivity): void {
		const { messageId, fileName, description } = activity;

		const mediaUrl = this.#buildMediaUrl(messageId, fileName);
		const controls = true;
		const audio = itemContainer.appendChild(DOMBuilder.newAudio(mediaUrl, { controls }));
		audio.classList.add("telegram-audio");

		if (description !== null) itemContainer.appendChild(DOMBuilder.newDescription(description));
	}

	#renderDocument(itemContainer: HTMLElement, activity: TelegramMediaPostActivity): void {
		const { messageId, fileName, description } = activity;

		const mediaUrl = this.#buildMediaUrl(messageId, fileName);
		const aLink = itemContainer.appendChild(DOMBuilder.newLink(fileName, mediaUrl));
		aLink.download = fileName;
		aLink.classList.add("telegram-document", "with-padding", "rounded");

		ActivityBuilder.newExternalIcon(aLink);

		if (description !== null) itemContainer.appendChild(DOMBuilder.newDescription(description));
	}

	#renderMedia(itemContainer: HTMLElement, activity: TelegramMediaPostActivity): void {
		const { mediaType } = activity;

		if (mediaType === "photo") return this.#renderPhoto(itemContainer, activity);
		if (mediaType === "animation") return this.#renderAnimation(itemContainer, activity);
		if (mediaType === "video") return this.#renderVideo(itemContainer, activity);
		if (mediaType === "audio") return this.#renderAudio(itemContainer, activity);
		if (mediaType === "document") return this.#renderDocument(itemContainer, activity);
	}

	#renderSingle(itemContainer: HTMLElement, activity: TelegramActivity): void {
		if (activity instanceof TelegramTextPostActivity) return this.#renderText(itemContainer, activity);
		if (activity instanceof TelegramMediaPostActivity) return this.#renderMedia(itemContainer, activity);
	}

	render(itemContainer: HTMLElement, buffer: readonly TelegramActivity[]): void {
		itemContainer.classList.add("flex", "column", "with-gap");

		for (const activity of buffer) {
			this.#renderSingle(itemContainer, activity);
		}
	}
}
//#endregion
