"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { TelegramChannelPost, TelegramUpdate } from "../models/telegram-event.js";
import { Activity, TelegramMediaPostActivity, TelegramTextPostActivity } from "../models/activity.js";

//#region Telegram walker
export class TelegramWalker extends ActivityWalker {
	#token: string;
	#channelId: string;

	constructor(token: string, channelId: string) {
		super("Telegram");
		this.#token = token;
		this.#channelId = channelId;
	}

	async *#fetchPosts(since: Date): AsyncIterable<TelegramChannelPost> {
		const url = new URL(`https://api.telegram.org/bot${this.#token}/getUpdates`);
		url.searchParams.set("limit", "100");
		url.searchParams.set("allowed_updates", `["channel_post"]`);
		const response = await fetch(url);
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const raw: { ok: boolean; result?: unknown[] } = await response.json();
		if (!raw.ok || raw.result === undefined) throw new Error("Telegram API returned ok=false");
		let index = 0;
		for (const item of raw.result) {
			try {
				const update = TelegramUpdate.import(item, `telegram_updates[${index++}]`);
				const { channelPost } = update;
				if (channelPost === undefined) continue;
				const chatId = String(channelPost.chat.id);
				const chatUsername = channelPost.chat.username !== undefined ? `@${channelPost.chat.username}` : null;
				if (chatId !== this.#channelId && chatUsername !== this.#channelId) continue;
				if (channelPost.date < since) continue;
				yield channelPost;
			} catch (reason) {
				console.error(reason);
			}
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		const platform = this.name;
		for await (const post of this.#fetchPosts(since)) {
			const { messageId, date: timestamp, text, caption, photo, audio, video, document } = post;
			const channelId = this.#channelId;

			if (photo !== undefined && photo.length > 0) {
				const largest = photo.reduce((max, p) => p.width * p.height > max.width * max.height ? p : max);
				yield new TelegramMediaPostActivity(platform, timestamp, messageId, channelId, "photo", largest.fileId, caption ?? null, "photo.jpg");
				continue;
			}
			if (audio !== undefined) {
				yield new TelegramMediaPostActivity(platform, timestamp, messageId, channelId, "audio", audio.fileId, caption ?? null, audio.fileName ?? `${audio.title ?? "audio"}.mp3`);
				continue;
			}
			if (video !== undefined) {
				yield new TelegramMediaPostActivity(platform, timestamp, messageId, channelId, "video", video.fileId, caption ?? null, video.fileName ?? "video.mp4");
				continue;
			}
			if (document !== undefined) {
				yield new TelegramMediaPostActivity(platform, timestamp, messageId, channelId, "document", document.fileId, caption ?? null, document.fileName ?? "document");
				continue;
			}
			if (text !== undefined) {
				yield new TelegramTextPostActivity(platform, timestamp, messageId, channelId, text);
			}
		}
	}
}
//#endregion
