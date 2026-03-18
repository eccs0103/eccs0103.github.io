"use strict";

import "adaptive-extender/node";
import { TelegramClient, MemoryStorage, Photo, Video, Audio, Voice, RawDocument, Message } from "@mtcute/node";
import { ActivityWalker } from "./activity-walker.js";
import { Activity, TelegramMediaPostActivity, TelegramTextPostActivity } from "../models/activity.js";

//#region Telegram walker
export class TelegramWalker extends ActivityWalker {
	#apiId: number;
	#apiHash: string;
	#session: string;
	#channelId: number;

	constructor(apiId: number, apiHash: string, session: string, channelId: number) {
		super("Telegram");
		this.#apiId = apiId;
		this.#apiHash = apiHash;
		this.#session = session;
		this.#channelId = channelId;
	}

	async *#fetchEvents(since: Date): AsyncIterable<Message> {
		const apiId = this.#apiId;
		const apiHash = this.#apiHash;
		const storage = new MemoryStorage();
		const disableUpdates = true;
		const telegram = new TelegramClient({ apiId, apiHash, storage, disableUpdates });
		await telegram.importSession(this.#session);
		await telegram.connect();
		await telegram.sendOnline(true);
		try {
			for await (const message of telegram.iterHistory(this.#channelId)) {
				if (message.date < since) break;
				yield message;
			}
		} finally {
			await telegram.disconnect();
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		const platform = this.name;
		const channelId = this.#channelId;
		for await (const message of this.#fetchEvents(since)) {
			const { id: messageId, text, media } = message;
			if (media === null) {
				yield new TelegramTextPostActivity(platform, message.date, channelId, messageId, text);
				continue;
			}
			if (media instanceof Photo) {
				const fileName = `${messageId}.jpg`;
				const description = text.insteadWhitespace(null);
				yield new TelegramMediaPostActivity(platform, message.date, channelId, messageId, fileName, "photo", description);
				continue;
			}
			if (media instanceof Audio) {
				const extension = media.mimeType === "audio/mpeg" ? "mp3" : (media.mimeType.split("/").at(-1) ?? "bin");
				const fileName = media.fileName ?? `${messageId}.${extension}`;
				const description = text.insteadWhitespace(null);
				yield new TelegramMediaPostActivity(platform, message.date, channelId, messageId, fileName, "audio", description);
				continue;
			}
			if (media instanceof Voice) {
				const fileName = media.fileName ?? `${messageId}.ogg`;
				const description = text.insteadWhitespace(null);
				yield new TelegramMediaPostActivity(platform, message.date, channelId, messageId, fileName, "audio", description);
				continue;
			}
			if (media instanceof Video) {
				const extension = media.mimeType.split("/").at(-1) ?? "mp4";
				const fileName = media.fileName ?? `${messageId}.${extension}`;
				const mediaType = media.isAnimation || media.isLegacyGif ? "animation" : "video";
				const description = text.insteadWhitespace(null);
				yield new TelegramMediaPostActivity(platform, message.date, channelId, messageId, fileName, mediaType, description);
				continue;
			}
			if (media instanceof RawDocument) {
				const extension = media.mimeType === "audio/mpeg" ? "mp3" : (media.mimeType.split("/").at(-1) ?? "bin");
				const fileName = media.fileName ?? `${messageId}.${extension}`;
				const description = text.insteadWhitespace(null);
				yield new TelegramMediaPostActivity(platform, message.date, channelId, messageId, fileName, "document", description);
				continue;
			}
		}
	}
}
//#endregion
