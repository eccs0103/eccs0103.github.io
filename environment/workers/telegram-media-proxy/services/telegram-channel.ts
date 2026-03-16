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
	#client: TelegramClient;
	#channelId: number;

	private constructor(client: TelegramClient, channelId: number) {
		this.#client = client;
		this.#channelId = channelId;
	}

	static async connect(apiId: number, apiHash: string, session: string, channelId: number): Promise<TelegramChannel> {
		const crypto = new WebCryptoProvider({ wasmInput });
		const client = new TelegramClient({ apiId, apiHash, storage: new MemoryStorage(), disableUpdates: true, crypto });
		await client.importSession(session);
		await client.connect();
		return new TelegramChannel(client, channelId);
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
