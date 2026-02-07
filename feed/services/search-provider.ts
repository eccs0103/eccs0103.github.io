"use strict";

import "adaptive-extender/node";
import { SearchResponse } from "../models/search-response";

//#region Search provider
export class SearchProvider {
	#apiKey: string;
	#searchId: string;

	constructor(apiKey: string, searchId: string) {
		this.#apiKey = apiKey;
		this.#searchId = searchId;
	}

	async search(query: string): Promise<string> {
		const url = new URL(`https://www.googleapis.com/customsearch/v1?key=${this.#apiKey}&cx=${this.#searchId}&q=${encodeURIComponent(query)}`);
		const response = await fetch(url);
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const object = await response.json();
		const search = SearchResponse.import(object, "search_response");
		const snippets = search.items.map(item => `Title: ${item.title}\nSnippet: ${item.snippet}`);
		return snippets.join("\n---\n");
	}
}
//#endregion
