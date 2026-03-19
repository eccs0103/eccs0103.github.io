"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Media proxy environment
export class MediaProxyEnvironment extends Model {
	@Field(Number, "TELEGRAM_CHANNEL_ID")
	channelId: number;

	@Field(Number, "TELEGRAM_API_ID")
	apiId: number;

	@Field(String, "TELEGRAM_API_HASH")
	apiHash: string;

	@Field(String, "TELEGRAM_SESSION")
	session: string;
}
//#endregion
