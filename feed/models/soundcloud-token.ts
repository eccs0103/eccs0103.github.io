"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region SoundCloud encrypted token
export interface SoundCloudEncryptedTokenScheme {
	iv: string;
	tag: string;
	ciphertext: string;
}

export class SoundCloudEncryptedToken extends Model {
	@Field(String, { name: "iv" })
	iv: string;

	@Field(String, { name: "tag" })
	tag: string;

	@Field(String, { name: "ciphertext" })
	ciphertext: string;

	constructor();
	constructor(iv: string, tag: string, ciphertext: string);
	constructor(iv?: string, tag?: string, ciphertext?: string) {
		if (iv === undefined || tag === undefined || ciphertext === undefined) {
			super();
			return;
		}

		super();
		this.iv = iv;
		this.tag = tag;
		this.ciphertext = ciphertext;
	}
}
//#endregion
