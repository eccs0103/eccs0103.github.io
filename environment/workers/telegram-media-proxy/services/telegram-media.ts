import "adaptive-extender/core";
import { TelegramClient, FileLocation } from "@mtcute/web";

//#region Telegram media
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

	download(): ReadableStream<Uint8Array> {
		const upstream = this.#client.downloadAsStream(this.#media);
		const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
		const cleanup = (): void => { void this.#client.disconnect(); };
		void upstream.pipeTo(writable).then(cleanup, cleanup);
		return readable;
	}
}
//#endregion
