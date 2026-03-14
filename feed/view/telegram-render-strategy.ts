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
		itemContainer.appendChild(DOMBuilder.newTextbox(text)).classList.add("telegram-text");
		this.#renderMessageLink(itemContainer, channelId, messageId);
	}

	#renderMedia(itemContainer: HTMLElement, activity: TelegramMediaPostActivity): void {
		const { fileId, mediaType, content, channelId, messageId, fileName } = activity;
		const mediaUrl = this.#buildMediaUrl(fileId, fileName);

		if (mediaType === "photo") {
			const figure = itemContainer.appendChild(document.createElement("figure"));
			figure.classList.add("telegram-media");
			figure.appendChild(DOMBuilder.newImage(mediaUrl, content ?? "Telegram photo")).classList.add("telegram-photo");
			if (content !== null) figure.appendChild(DOMBuilder.newDescription(content)).classList.add("telegram-caption");
		} else if (mediaType === "gif") {
			const figure = itemContainer.appendChild(document.createElement("figure"));
			figure.classList.add("telegram-media");
			figure.appendChild(DOMBuilder.newVideo(mediaUrl, { autoplay: true, loop: true, muted: true, playsInline: true })).classList.add("telegram-gif");
			if (content !== null) figure.appendChild(DOMBuilder.newDescription(content)).classList.add("telegram-caption");
		} else if (mediaType === "video") {
			const figure = itemContainer.appendChild(document.createElement("figure"));
			figure.classList.add("telegram-media");
			figure.appendChild(DOMBuilder.newVideo(mediaUrl, { controls: true })).classList.add("telegram-video");
			if (content !== null) figure.appendChild(DOMBuilder.newDescription(content)).classList.add("telegram-caption");
		} else if (mediaType === "audio") {
			itemContainer.appendChild(DOMBuilder.newAudio(mediaUrl)).classList.add("telegram-audio");
			if (content !== null) itemContainer.appendChild(DOMBuilder.newDescription(content));
		} else if (mediaType === "document") {
			const aLink = itemContainer.appendChild(DOMBuilder.newLink(fileName ?? "Download file", mediaUrl));
			aLink.download = fileName ?? "download";
			aLink.classList.add("telegram-document", "with-padding", "rounded");
			ActivityBuilder.newExternalIcon(aLink);
			if (content !== null) itemContainer.appendChild(DOMBuilder.newDescription(content));
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
