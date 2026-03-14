"use strict";

import "adaptive-extender/node";
import { TelegramClient, MemoryStorage, Photo, Video, Audio, Voice, RawDocument } from "@mtcute/node";
import { ActivityWalker } from "./activity-walker.js";
import { Activity, TelegramMediaPostActivity, TelegramTextPostActivity } from "../models/activity.js";

//#region Telegram walker
export class TelegramWalker extends ActivityWalker {
	#apiId: number;
	#apiHash: string;
	#session: string;
	#channelId: string;

	constructor(apiId: number, apiHash: string, session: string, channelId: string) {
		super("Telegram");
		this.#apiId = apiId;
		this.#apiHash = apiHash;
		this.#session = session;
		this.#channelId = channelId;
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		const platform = this.name;
		const tg = new TelegramClient({
			apiId: this.#apiId,
			apiHash: this.#apiHash,
			storage: new MemoryStorage(),
			disableUpdates: true,
		});
		await tg.importSession(this.#session);
		await tg.connect();
		try {
			for await (const message of tg.iterHistory(Number(this.#channelId), {})) {
				if (message.date < since) break;
				const { id: messageId, text, media } = message;
				const fileId = String(messageId);

				if (media instanceof Photo) {
					yield new TelegramMediaPostActivity(platform, message.date, messageId, this.#channelId, "photo", fileId, text || null, "photo.jpg");
					continue;
				}
				if (media instanceof Audio) {
					const fileName = media.fileName ?? `${messageId}.mp3`;
					yield new TelegramMediaPostActivity(platform, message.date, messageId, this.#channelId, "audio", fileId, text || null, fileName);
					continue;
				}
				if (media instanceof Voice) {
					yield new TelegramMediaPostActivity(platform, message.date, messageId, this.#channelId, "audio", fileId, text || null, `${messageId}.ogg`);
					continue;
				}
				if (media instanceof Video) {
					const fileName = media.fileName ?? `${messageId}.mp4`;
					const mediaType = media.isAnimation || media.isLegacyGif ? "gif" : "video";
					yield new TelegramMediaPostActivity(platform, message.date, messageId, this.#channelId, mediaType, fileId, text || null, fileName);
					continue;
				}
				if (media instanceof RawDocument) {
					const fileName = media.fileName ?? `${messageId}`;
					yield new TelegramMediaPostActivity(platform, message.date, messageId, this.#channelId, "document", fileId, text || null, fileName);
					continue;
				}
				if (text && text.length > 0) {
					yield new TelegramTextPostActivity(platform, message.date, messageId, this.#channelId, text);
				}
			}
		} finally {
			await tg.disconnect();
		}
	}
}
//#endregion
