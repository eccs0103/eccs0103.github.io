"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { PinterestBoard, PinterestPin, PinterestResponse } from "../models/pinterest-event.js";
import { Activity, PinterestPinActivity } from "../models/activity.js";

//#region Pinterest walker
export class PinterestWalker extends ActivityWalker {
	#token: string;

	constructor(token: string) {
		super("Pinterest");
		this.#token = token;
	}

	async *#fetchPaginated(endpoint: string, count: number): AsyncIterable<any> {
		let bookmark: string | null = null;
		do {
			const url = new URL(`https://api.pinterest.com/v5${endpoint}`);
			url.searchParams.set("page_size", String(count));
			if (bookmark !== null) url.searchParams.set("bookmark", bookmark);
			const headers: HeadersInit = {
				["Authorization"]: `Bearer ${this.#token}`,
				["Content-Type"]: "application/json"
			};
			const response = await fetch(url, { headers });
			if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
			const data = PinterestResponse.import(await response.json(), "pinterest_response");
			if (data.code !== undefined && data.message !== undefined) throw new Error(`${data.code}: ${data.message}`);
			bookmark = data.bookmark;
			yield *data.items;
		} while (bookmark);
	}

	async *#fetchBoards(): AsyncIterable<PinterestBoard> {
		let index = 0;
		for await (const item of this.#fetchPaginated("/boards", 50)) {
			try {
				yield PinterestBoard.import(item, `board[${index++}]`);
			} catch (reason) {
				console.error(reason);
			}
		}
	}

	async *#fetchPins(boardId: string, since: Date): AsyncIterable<PinterestPin> {
		let index = 0;
		for await (const item of this.#fetchPaginated(`/boards/${boardId}/pins`, 50)) {
			try {
				const pin = PinterestPin.import(item, `pin[${index++}]`);
				const date = new Date(pin.createdAt);
				if (date < since) return;
				yield pin;
			} catch (reason) {
				console.error(reason);
			}
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		for await (const board of this.#fetchBoards()) {
			for await (const pin of this.#fetchPins(board.id, since)) {
				const platform = this.name;
				const timestamp = new Date(pin.createdAt);
				yield new PinterestPinActivity(
					platform,
					timestamp,
					pin.title ?? "Untitled Pin",
					pin.description,
					pin.imageUrl,
					pin.link ?? `https://www.pinterest.com/pin/${pin.id}/`,
					board.name
				);
			}
		}
	}
}
//#endregion
