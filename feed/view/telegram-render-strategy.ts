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

	#renderPhotoGroup(itemContainer: HTMLElement, photos: TelegramMediaPostActivity[]): void {
		const slides = photos.map(photo => {
			const { messageId, fileName, description } = photo;
			const mediaUrl = this.#buildMediaUrl(messageId, fileName);
			const img = DOMBuilder.newImage(mediaUrl, description ?? "Telegram photo");
			img.classList.add("telegram-photo");
			return img;
		});

		const carousel = itemContainer.appendChild(DOMBuilder.newCarousel(slides));
		carousel.classList.add("telegram-carousel");

		const caption = photos.find(photo => photo.description !== null)?.description ?? null;
		if (caption !== null) {
			itemContainer.appendChild(DOMBuilder.newDescription(caption));
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
		const aLink = itemContainer.appendChild(DOMBuilder.newLink(String.empty, mediaUrl));
		aLink.download = fileName;
		aLink.classList.add("telegram-document", "rounded", "with-padding", "flex", "with-gap", "alt-center");

		aLink.appendChild(DOMBuilder.newIcon(new URL("./icons/file.svg", new URL("../", document.baseURI))));

		aLink.appendChild(DOMBuilder.newTextbox(fileName));

		if (description !== null) itemContainer.appendChild(DOMBuilder.newDescription(description));
	}

	#renderMedia(itemContainer: HTMLElement, activity: TelegramMediaPostActivity): void {
		const { mediaType } = activity;

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

		let index = 0;
		while (index < buffer.length) {
			const activity = buffer[index];

			if (activity instanceof TelegramMediaPostActivity && activity.mediaType === "photo") {
				const photos: TelegramMediaPostActivity[] = [activity];
				while (index + 1 < buffer.length) {
					const next = buffer[index + 1];
					if (!(next instanceof TelegramMediaPostActivity) || next.mediaType !== "photo") break;
					photos.push(next);
					index++;
				}
				this.#renderPhotoGroup(itemContainer, photos);
			} else {
				this.#renderSingle(itemContainer, activity);
			}

			index++;
		}
	}
}
//#endregion
