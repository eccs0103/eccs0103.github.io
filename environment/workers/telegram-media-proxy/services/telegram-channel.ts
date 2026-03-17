"use strict";

import "adaptive-extender/core";
import { TelegramClient, MemoryStorage, FileLocation, Photo, RawDocument, WebCryptoProvider } from "@mtcute/web";
import wasmInput from "@mtcute/wasm/mtcute-simd.wasm";

//#region Telegram media info
export interface TelegramMediaInfo {
	mimeType: string;
	fileSize: number | undefined;
	download(): ReadableStream<Uint8Array>;
}
//#endregion

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

	static async connect(channelId: number, apiId: number, apiHash: string, session: string): Promise<TelegramChannel> {
		const storage = new MemoryStorage();
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

	async fetchMedia(messageId: number): Promise<TelegramMediaInfo> {
		const messages = await this.#client.getMessages(this.#channelId, [messageId]);
		const [message] = messages;
		if (message === null) throw new ReferenceError("Message not found");
		const { media } = message;
		if (media === null) throw new ReferenceError("Message has no media");
		if (!(media instanceof FileLocation)) throw new TypeError("Message media is not downloadable");
		const mimeType = media instanceof Photo ? "image/jpeg" : media instanceof RawDocument ? media.mimeType : "application/octet-stream";
		const { fileSize } = media;
		const client = this.#client;
		return {
			mimeType,
			fileSize,
			download(): ReadableStream<Uint8Array> {
				const upstream = client.downloadAsStream(media);
				const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
				const cleanup = (): void => { void client.disconnect(); };
				void upstream.pipeTo(writable).then(cleanup, cleanup);
				return readable;
			},
		};
	}

	async disconnect(): Promise<void> {
		await this.#client.disconnect();
	}
}
//#endregion
