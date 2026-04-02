"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Feed batch loaded
export class FeedBatchLoaded extends Model {
	/** Number of batches loaded so far including the one just fetched. Increments by one per successful load call. */
	@Field(Number, "batches_loaded")
	batchesLoaded: number;

	constructor();
	constructor(batchesLoaded: number);
	constructor(batchesLoaded?: number) {
		if (batchesLoaded === undefined) {
			super();
			return;
		}

		super();
		this.batchesLoaded = batchesLoaded;
	}
}
//#endregion
