"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Model } from "adaptive-extender/core";

//#region Search item
export interface SearchItemScheme {
	title: string;
	snippet: string;
}

export class SearchItem extends Model {
	@Field(String, "title")
	title: string;

	@Field(String, "snippet")
	snippet: string;
}
//#endregion
//#region Search response
export interface SearchResponseScheme {
	items: SearchItemScheme[];
}

export class SearchResponse extends Model {
	@Field(ArrayOf(SearchItem), "items")
	items: SearchItem[];
}
//#endregion
