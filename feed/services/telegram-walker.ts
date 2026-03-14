"use strict";

import "adaptive-extender/node";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
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
		const channelId = this.#channelId;
		const session = new StringSession(this.#session);
		const client = new TelegramClient(session, this.#apiId, this.#apiHash, { connectionRetries: 3 });
		await client.connect();
		try {
			for await (const message of client.iterMessages(channelId, { limit: 300, waitTime: 0 })) {
				if (!(message instanceof Api.Message)) continue;
				const timestamp = new Date(message.date * 1000);
				if (timestamp < since) break;
				const messageId = message.id;
				const { message: text, media } = message;
				const fileId = String(messageId);

				if (media instanceof Api.MessageMediaPhoto) {
					yield new TelegramMediaPostActivity(platform, timestamp, messageId, channelId, "photo", fileId, text || null, "photo.jpg");
					continue;
				}
				if (media instanceof Api.MessageMediaDocument) {
					const { document } = media;
					if (!(document instanceof Api.Document)) continue;
					const audioAttr = document.attributes.find((a): a is Api.DocumentAttributeAudio => a instanceof Api.DocumentAttributeAudio);
					const videoAttr = document.attributes.find((a): a is Api.DocumentAttributeVideo => a instanceof Api.DocumentAttributeVideo);
					const fileAttr = document.attributes.find((a): a is Api.DocumentAttributeFilename => a instanceof Api.DocumentAttributeFilename);
					const caption = text || null;
					if (audioAttr !== undefined) {
						const fileName = fileAttr?.fileName ?? `${messageId}.mp3`;
						yield new TelegramMediaPostActivity(platform, timestamp, messageId, channelId, "audio", fileId, caption, fileName);
						continue;
					}
					if (videoAttr !== undefined) {
						const fileName = fileAttr?.fileName ?? `${messageId}.mp4`;
						yield new TelegramMediaPostActivity(platform, timestamp, messageId, channelId, "video", fileId, caption, fileName);
						continue;
					}
					const fileName = fileAttr?.fileName ?? `${messageId}`;
					yield new TelegramMediaPostActivity(platform, timestamp, messageId, channelId, "document", fileId, caption, fileName);
					continue;
				}
				if (text !== undefined && text.length > 0) {
					yield new TelegramTextPostActivity(platform, timestamp, messageId, channelId, text);
				}
			}
		} finally {
			await client.disconnect();
		}
	}
}
//#endregion
