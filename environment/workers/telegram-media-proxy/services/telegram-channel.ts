"use strict";

import "adaptive-extender/core";
import { TelegramClient, MemoryStorage, FileLocation, RawDocument, WebCryptoProvider } from "@mtcute/web";
import wasmInput from "@mtcute/wasm/mtcute-simd.wasm";
import { TelegramMedia } from "./telegram-media.js";

//#region Telegram channel
export class TelegramChannel {
	static #lock: boolean = true;
	#client: TelegramClient;
	#channelIdentifier: number;

	constructor(client: TelegramClient, channelIdentifier: number) {
		if (TelegramChannel.#lock) throw new TypeError("Illegal constructor");
		this.#client = client;
		this.#channelIdentifier = channelIdentifier;
	}

	static async connect(channelIdentifier: number, apiIdentifier: number, apiHash: string, session: string): Promise<TelegramChannel> {
		const storage = new MemoryStorage();
		const disableUpdates = true;
		const crypto = new WebCryptoProvider({ wasmInput });
		const client = new TelegramClient({ apiId: apiIdentifier, apiHash, storage, disableUpdates, crypto });
		await client.importSession(session);
		await client.connect();
		TelegramChannel.#lock = false;
		const channel = new TelegramChannel(client, channelIdentifier);
		TelegramChannel.#lock = true;
		return channel;
	}

	async fetchMedia(messageIdentifier: number, fileName: string): Promise<TelegramMedia> {
		const messages = await this.#client.getMessages(this.#channelIdentifier, [messageIdentifier]);
		const message = messages[0];
		if (message === null) throw new ReferenceError("Message not found");
		const { media } = message;
		if (media === null) throw new ReferenceError("Message has no media");
		if (!(media instanceof FileLocation)) throw new TypeError("Message media is not downloadable");
		const mimeType = media instanceof RawDocument ? media.mimeType : "image/jpeg";
		const mediaSize = media.fileSize ?? Number.POSITIVE_INFINITY;
		return new TelegramMedia(mimeType, mediaSize, fileName, this.#client, media);
	}

	async disconnect(): Promise<void> {
		await this.#client.disconnect();
	}
}
//#endregion
