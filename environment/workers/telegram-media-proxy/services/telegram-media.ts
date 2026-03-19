"use strict";

import "adaptive-extender/core";
import { TelegramClient, FileLocation } from "@mtcute/web";

//#region Telegram media
export interface TelegramMediaDownloadOptions {
	offset: number;
	limit: number;
}

export class TelegramMedia {
	#mimeType: string;
	#fileSize: number | undefined;
	#client: TelegramClient;
	#media: FileLocation;

	constructor(mimeType: string, fileSize: number | undefined, client: TelegramClient, media: FileLocation) {
		this.#mimeType = mimeType;
		this.#fileSize = fileSize;
		this.#client = client;
		this.#media = media;
	}

	get mimeType(): string {
		return this.#mimeType;
	}

	get fileSize(): number | undefined {
		return this.#fileSize;
	}

	download(): ReadableStream<Uint8Array>;
	download(options: Partial<TelegramMediaDownloadOptions>): ReadableStream<Uint8Array>;
	download(options: Partial<TelegramMediaDownloadOptions> = {}): ReadableStream<Uint8Array> {
		const { offset, limit } = options;
		const upstream = this.#client.downloadAsStream(this.#media, { offset, limit });
		const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
		void upstream.pipeTo(writable);
		return readable;
	}
}
//#endregion
