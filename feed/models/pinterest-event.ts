"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Model, Nullable, Optional, Any } from "adaptive-extender/core";

//#region Pinterest token
export interface PinterestTokenScheme {
	access_token: string;
	scope: string;
}

export class PinterestToken extends Model {
	@Field(String, "access_token")
	accessToken: string;

	@Field(String, "scope")
	scope: string;
}
//#endregion

//#region Pinterest image
export interface PinterestImageScheme {
	url: string;
	width: number;
	height: number;
}

export class PinterestImage extends Model {
	@Field(String, "url")
	url: string;

	@Field(Number, "width")
	width: number;

	@Field(Number, "height")
	height: number;
}
//#endregion

//#region Pinterest images collection
export interface PinterestImagesCollectionScheme {
	"150x150"?: PinterestImageScheme;
	"400x300"?: PinterestImageScheme;
	"600x"?: PinterestImageScheme;
	"1200x"?: PinterestImageScheme;
}

export class PinterestImagesCollection extends Model {
	@Field(Optional(PinterestImage), "150x150")
	thumbnail: PinterestImage | undefined;

	@Field(Optional(PinterestImage), "400x300")
	feed: PinterestImage | undefined;

	@Field(Optional(PinterestImage), "600x")
	preview: PinterestImage | undefined;

	@Field(Optional(PinterestImage), "1200x")
	original: PinterestImage | undefined;
}
//#endregion

//#region Pinterest media container
export interface PinterestMediaContainerScheme {
	media_type?: string;
	images: PinterestImagesCollectionScheme;
}

export class PinterestMediaContainer extends Model {
	@Field(Optional(String), "media_type")
	mediaType: string | undefined;

	@Field(PinterestImagesCollection, "images")
	images: PinterestImagesCollection;
}
//#endregion

//#region Pinterest owner
interface PinterestOwnerScheme {
	username: string;
}
//#endregion

//#region Pinterest board
export interface PinterestBoardScheme {
	id: string;
	name: string;
	description: string | null;
	// owner: PinterestOwnerScheme;
	privacy: string;
}

export class PinterestBoard extends Model {
	@Field(String, "id")
	id: string;

	@Field(String, "name")
	name: string;

	@Field(Nullable(String), "description")
	description: string | null;

	@Field(String, "privacy")
	privacy: string;
}
//#endregion

//#region Pinterest pin
export interface PinterestPinScheme {
	id: string;
	created_at: string;
	link: string | null;
	title: string | null;
	description: string | null;
	alt_text: string | null;
	board_id: string;
	media: PinterestMediaContainerScheme | null;
}

export class PinterestPin extends Model {
	@Field(String, "id")
	id: string;

	@Field(Date, "created_at")
	createdAt: Date;

	@Field(Nullable(String), "link")
	link: string | null;

	@Field(Nullable(String), "title")
	title: string | null;

	@Field(Nullable(String), "description")
	description: string | null;

	@Field(Nullable(String), "alt_text")
	altText: string | null;

	@Field(String, "board_id")
	boardId: string;

	@Field(Nullable(PinterestMediaContainer), "media")
	media: PinterestMediaContainer | null;
}
//#endregion

//#region Pinterest response
export interface PinterestResponseScheme<T = any> {
	items: T[];
	bookmark: string | null;
	code?: number;
	message?: string;
}

export class PinterestResponse extends Model {
	@Field(ArrayOf(Any), "items")
	items: any[];

	@Field(Nullable(String), "bookmark")
	bookmark: string | null;

	@Field(Optional(Number), "code")
	code: number | undefined;

	@Field(Optional(String), "message")
	message: string | undefined;
}
//#endregion
