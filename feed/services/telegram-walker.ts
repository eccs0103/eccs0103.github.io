"use strict";

import "adaptive-extender/node";
import { TelegramClient, MemoryStorage, Photo, Video, Audio, Voice, RawDocument, Message } from "@mtcute/node";
import { ActivityWalker } from "./activity-walker.js";
import { Activity, TelegramMediaPostActivity, TelegramTextPostActivity } from "../models/activity.js";

//#region Telegram walker
export class TelegramWalker extends ActivityWalker {
	static #MIME_EXTENSIONS: ReadonlyMap<string, string> = new Map([
		["audio/mpeg", "mp3"],
		["audio/ogg", "ogg"],
		["audio/mp4", "m4a"],
		["audio/aac", "aac"],
		["audio/flac", "flac"],
		["audio/wav", "wav"],
		["video/mp4", "mp4"],
		["video/webm", "webm"],
		["video/quicktime", "mov"],
		["video/x-matroska", "mkv"],
		["image/jpeg", "jpg"],
		["image/png", "png"],
		["image/gif", "gif"],
		["image/webp", "webp"],
		["application/pdf", "pdf"],
		["application/zip", "zip"],
	]);

	#channelId: number;
	#apiId: number;
	#apiHash: string;
	#session: string;

	constructor(channelId: number, apiId: number, apiHash: string, session: string) {
		super("Telegram");
		this.#channelId = channelId;
		this.#apiId = apiId;
		this.#apiHash = apiHash;
		this.#session = session;
	}

	static #extensionFor(mimeType: string): string | null {
		let extension = TelegramWalker.#MIME_EXTENSIONS.get(mimeType);
		if (extension !== undefined) return extension;
		extension = mimeType.split("/").at(-1);
		if (extension === undefined) return null;
		console.warn(`Unknown MIME type '${mimeType}' successfully resolved. Verify consistency before proceeding.`);
		return extension;
	}

	async *#fetchEvents(since: Date): AsyncIterable<Message> {
		const apiId = this.#apiId;
		const apiHash = this.#apiHash;
		const storage = new MemoryStorage();
		const telegram = new TelegramClient({ apiId, apiHash, storage });
		await telegram.importSession(this.#session);
		await telegram.connect();
		await telegram.sendOnline(false);
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
			if (!message.isChannelPost) continue;
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
				const extension = TelegramWalker.#extensionFor(media.mimeType);
				if (extension === null) continue;
				const fileName = media.fileName ?? `${messageId}.${extension}`;
				const description = text.insteadWhitespace(null);
				yield new TelegramMediaPostActivity(platform, message.date, channelId, messageId, fileName, "audio", description);
				continue;
			}
			if (media instanceof Voice) {
				const extension = TelegramWalker.#extensionFor(media.mimeType);
				if (extension === null) continue;
				const fileName = media.fileName ?? `${messageId}.${extension}`;
				const description = text.insteadWhitespace(null);
				yield new TelegramMediaPostActivity(platform, message.date, channelId, messageId, fileName, "audio", description);
				continue;
			}
			if (media instanceof Video) {
				const extension = TelegramWalker.#extensionFor(media.mimeType);
				if (extension === null) continue;
				const fileName = media.fileName ?? `${messageId}.${extension}`;
				const mediaType = media.isAnimation || media.isLegacyGif ? "animation" : "video";
				const description = text.insteadWhitespace(null);
				yield new TelegramMediaPostActivity(platform, message.date, channelId, messageId, fileName, mediaType, description);
				continue;
			}
			if (media instanceof RawDocument) {
				const extension = TelegramWalker.#extensionFor(media.mimeType);
				if (extension === null) continue;
				const fileName = media.fileName ?? `${messageId}.${extension}`;
				const description = text.insteadWhitespace(null);
				yield new TelegramMediaPostActivity(platform, message.date, channelId, messageId, fileName, "document", description);
				continue;
			}
		}
	}
}
//#endregion
