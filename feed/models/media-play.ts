"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Media play
export class MediaPlay extends Model {
	/** HTML tag name of the media element that started playing: "video" or "audio". Derived from HTMLMediaElement.tagName.toLowerCase(). */
	@Field(String, "media_type")
	mediaType: string;

	constructor();
	constructor(mediaType: string);
	constructor(mediaType?: string) {
		if (mediaType === undefined) {
			super();
			return;
		}

		super();
		this.mediaType = mediaType;
	}
}
//#endregion
