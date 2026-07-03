"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Search item
export interface SearchItemScheme {
	title: string;
	snippet: string;
}

export class SearchItem extends Model {
	@Field(String, { name: "title" })
	title: string;

	@Field(String, { name: "snippet" })
	snippet: string;
}
//#endregion
//#region Search response
export interface SearchResponseScheme {
	items: SearchItemScheme[];
}

export class SearchResponse extends Model {
	@Field(Array.Of(SearchItem), { name: "items" })
	items: SearchItem[];
}
//#endregion
