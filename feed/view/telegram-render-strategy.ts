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

	#buildMediaUrl(fileId: string): URL {
		const url = new URL(this.#urlProxy);
		url.searchParams.set("identifier", fileId);
		return url;
	}

	#renderMessageLink(itemContainer: HTMLElement, channelId: string, messageId: number): void {
		if (!channelId.startsWith("@")) return;
		const username = channelId.slice(1);
		const url = new URL(`https://t.me/${username}/${messageId}`);
		const aLink = itemContainer.appendChild(DOMBuilder.newLink("View on Telegram ", url));
		aLink.classList.add("with-block-padding", "font-smaller-3");
		ActivityBuilder.newExternalIcon(aLink);
	}

	#renderText(itemContainer: HTMLElement, activity: TelegramTextPostActivity): void {
		const { text, channelId, messageId } = activity;

		const spanText = itemContainer.appendChild(DOMBuilder.newTextbox(text));
		spanText.classList.add("telegram-text");

		this.#renderMessageLink(itemContainer, channelId, messageId);
	}

	#renderMedia(itemContainer: HTMLElement, activity: TelegramMediaPostActivity): void {
		const { fileId, mediaType, content, channelId, messageId } = activity;
		const mediaUrl = this.#buildMediaUrl(fileId);

		if (mediaType === "photo") {
			const imgPhoto = itemContainer.appendChild(DOMBuilder.newImage(mediaUrl, content ?? "Telegram photo"));
			imgPhoto.classList.add("telegram-photo");
		} else if (mediaType === "audio") {
			const audioEl = itemContainer.appendChild(document.createElement("audio"));
			audioEl.src = String(mediaUrl);
			audioEl.controls = true;
			audioEl.classList.add("telegram-audio");
		} else if (mediaType === "video") {
			const videoEl = itemContainer.appendChild(document.createElement("video"));
			videoEl.src = String(mediaUrl);
			videoEl.controls = true;
			videoEl.classList.add("telegram-video");
		} else if (mediaType === "document") {
			const aDoc = itemContainer.appendChild(DOMBuilder.newLink("Download file ", mediaUrl));
			aDoc.classList.add("with-block-padding", "font-smaller-3");
			ActivityBuilder.newExternalIcon(aDoc);
		}

		if (content !== null) {
			itemContainer.appendChild(DOMBuilder.newDescription(content));
		}

		this.#renderMessageLink(itemContainer, channelId, messageId);
	}

	render(itemContainer: HTMLElement, buffer: readonly TelegramActivity[]): void {
		itemContainer.classList.add("flex", "column", "with-gap");

		for (const activity of buffer) {
			if (activity instanceof TelegramTextPostActivity) {
				this.#renderText(itemContainer, activity);
			} else if (activity instanceof TelegramMediaPostActivity) {
				this.#renderMedia(itemContainer, activity);
			}
		}
	}
}
//#endregion
