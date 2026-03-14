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

	#buildMediaUrl(fileId: string, fileName: string): URL {
		const url = new URL(this.#urlProxy);
		url.searchParams.set("identifier", fileId);
		url.searchParams.set("filename", fileName);
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
		const { fileId, mediaType, content, channelId, messageId, fileName } = activity;
		const mediaUrl = this.#buildMediaUrl(fileId, fileName);

		if (mediaType === "photo") {
			const img = itemContainer.appendChild(DOMBuilder.newImage(mediaUrl, content ?? "Telegram photo"));
			img.classList.add("telegram-photo");
		} else if (mediaType === "audio") {
			const audio = itemContainer.appendChild(document.createElement("audio"));
			audio.src = String(mediaUrl);
			audio.controls = true;
			audio.classList.add("telegram-audio");
		} else if (mediaType === "video") {
			const video = itemContainer.appendChild(document.createElement("video"));
			video.src = String(mediaUrl);
			video.controls = true;
			video.classList.add("telegram-video");
		} else if (mediaType === "document") {
			const aLink = itemContainer.appendChild(DOMBuilder.newLink(fileName ?? "Download file", mediaUrl));
			aLink.download = fileName ?? "download";
			aLink.classList.add("with-block-padding", "font-smaller-3");
			ActivityBuilder.newExternalIcon(aLink);
		}

		if (content !== null) itemContainer.appendChild(DOMBuilder.newDescription(content));
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
