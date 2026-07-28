"use strict";

import "adaptive-extender/node";
import { TelegramClient, MemoryStorage, Photo, Video, Audio, Voice, RawDocument, Message } from "@mtcute/node";
import { ActivitySource } from "./activity-source.js";
import { ActivityWalker } from "./activity-walker.js";
import { Activity, TelegramMediaPostActivity, TelegramTextPostActivity } from "../models/activity.js";

//#region Telegram post source
class TelegramPostSource extends ActivitySource<Message, Message> {
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
		["text/plain", "txt"],
		["text/x-ini", "ini"],
		["application/msword", "doc"],
		["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
		["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
		["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
	]);

	#channelId: number;
	#apiId: number;
	#apiHash: string;
	#session: string;

	constructor(platform: string, channelId: number, apiId: number, apiHash: string, session: string) {
		super(platform);
		this.#channelId = channelId;
		this.#apiId = apiId;
		this.#apiHash = apiHash;
		this.#session = session;
	}

	static #extensionFor(mimeType: string): string | null {
		let extension = TelegramPostSource.#MIME_EXTENSIONS.get(mimeType);
		if (extension !== undefined) return extension;
		extension = mimeType.split("/").at(-1);
		if (extension === undefined) return null;
		console.warn(`Unknown MIME type '${mimeType}' successfully resolved. Verify consistency before proceeding.`);
		return extension;
	}

	async *fetch(): AsyncIterable<Message> {
		const apiId = this.#apiId;
		const apiHash = this.#apiHash;
		const storage = new MemoryStorage();
		const telegram = new TelegramClient({ apiId, apiHash, storage });
		await telegram.importSession(this.#session);
		await telegram.connect();
		await telegram.sendOnline(false);
		try {
			yield* telegram.iterHistory(this.#channelId);
		} finally {
			await telegram.disconnect();
		}
	}

	parse(source: Message, name: string): Message {
		void name;
		return source;
	}

	stamp(event: Message): Date {
		return event.date;
	}

	*map(event: Message): Iterable<Activity> {
		const platform = this.platform;
		const channelId = this.#channelId;
		const { id: messageId, text, media } = event;
		if (!event.isChannelPost) return;
		if (media === null) {
			yield new TelegramTextPostActivity(platform, event.date, channelId, messageId, text);
			return;
		}
		if (media instanceof Photo) {
			const fileName = `${messageId}.jpg`;
			const description = text.insteadWhitespace(null);
			yield new TelegramMediaPostActivity(platform, event.date, channelId, messageId, fileName, "photo", description);
			return;
		}
		if (media instanceof Audio) {
			const extension = TelegramPostSource.#extensionFor(media.mimeType);
			if (extension === null) return;
			const fileName = media.fileName ?? `${messageId}.${extension}`;
			const description = text.insteadWhitespace(null);
			yield new TelegramMediaPostActivity(platform, event.date, channelId, messageId, fileName, "audio", description);
			return;
		}
		if (media instanceof Voice) {
			const extension = TelegramPostSource.#extensionFor(media.mimeType);
			if (extension === null) return;
			const fileName = media.fileName ?? `${messageId}.${extension}`;
			const description = text.insteadWhitespace(null);
			yield new TelegramMediaPostActivity(platform, event.date, channelId, messageId, fileName, "audio", description);
			return;
		}
		if (media instanceof Video) {
			const extension = TelegramPostSource.#extensionFor(media.mimeType);
			if (extension === null) return;
			const fileName = media.fileName ?? `${messageId}.${extension}`;
			const mediaType = media.isAnimation || media.isLegacyGif ? "animation" : "video";
			const description = text.insteadWhitespace(null);
			yield new TelegramMediaPostActivity(platform, event.date, channelId, messageId, fileName, mediaType, description);
			return;
		}
		if (media instanceof RawDocument) {
			const extension = TelegramPostSource.#extensionFor(media.mimeType);
			if (extension === null) return;
			const fileName = media.fileName ?? `${messageId}.${extension}`;
			const description = text.insteadWhitespace(null);
			yield new TelegramMediaPostActivity(platform, event.date, channelId, messageId, fileName, "document", description);
			return;
		}
	}
}
//#endregion

//#region Telegram walker
export class TelegramWalker extends ActivityWalker {
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

	async *sources(): AsyncIterable<ActivitySource<unknown, unknown>> {
		yield new TelegramPostSource(this.name, this.#channelId, this.#apiId, this.#apiHash, this.#session);
	}
}
//#endregion
