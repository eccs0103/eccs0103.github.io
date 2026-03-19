"use strict";

import "adaptive-extender/core";
import { TelegramClient, MemoryStorage, FileLocation, RawDocument, WebCryptoProvider } from "@mtcute/web";
import wasmInput from "@mtcute/wasm/mtcute-simd.wasm";
import { TelegramMedia } from "./telegram-media.js";

//#region Telegram channel
export class TelegramChannel {
	static #lock: boolean = true;
	#client: TelegramClient;
	#channelId: number;

	constructor(client: TelegramClient, channelId: number) {
		if (TelegramChannel.#lock) throw new TypeError("Illegal constructor");
		this.#client = client;
		this.#channelId = channelId;
	}

	// Creates a fresh per-request connection. Singleton is intentionally avoided:
	// CF Workers binds I/O objects (WebSocket) to the originating request context
	// and forbids reuse across different request contexts.
	static async connect(channelId: number, apiId: number, apiHash: string, session: string): Promise<TelegramChannel> {		const storage = new MemoryStorage();
		const disableUpdates = true;
		const crypto = new WebCryptoProvider({ wasmInput });
		const client = new TelegramClient({ apiId, apiHash, storage, disableUpdates, crypto });
		await client.importSession(session);
		await client.connect();
		TelegramChannel.#lock = false;
		const channel = new TelegramChannel(client, channelId);
		TelegramChannel.#lock = true;
		return channel;
	}

	async fetchMedia(messageId: number): Promise<TelegramMedia> {
		const messages = await this.#client.getMessages(this.#channelId, [messageId]);
		const [message] = messages;
		if (message === null) throw new ReferenceError("Message not found");
		const { media } = message;
		if (media === null) throw new ReferenceError("Message has no media");
		if (!(media instanceof FileLocation)) throw new TypeError("Message media is not downloadable");
		const mimeType = media instanceof RawDocument ? media.mimeType : "image/jpeg";
		const { fileSize } = media;
		return new TelegramMedia(mimeType, fileSize, this.#client, media);
	}

	async disconnect(): Promise<void> {
		await this.#client.disconnect();
	}
}
//#endregion
