"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Boolean response
export interface BooleanResponseScheme {
	result: boolean;
}

export class BooleanResponse extends Model {
	@Field(Boolean, "result")
	result: boolean;
}
//#endregion
