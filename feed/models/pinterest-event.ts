"use strict";

import "adaptive-extender/core";

//#region Pinterest image
export interface PinterestImageScheme {
	url: string;
	width: number;
	height: number;
}

export class PinterestImage {
	#url: string;
	#width: number;
	#height: number;

	constructor(url: string, width: number, height: number) {
		this.#url = url;
		this.#width = width;
		this.#height = height;
	}

	static import(source: any, name: string): PinterestImage {
		const object = Object.import(source, name);
		const url = String.import(Reflect.get(object, "url"), `${name}.url`);
		const width = Number.import(Reflect.get(object, "width"), `${name}.width`);
		const height = Number.import(Reflect.get(object, "height"), `${name}.height`);
		const result = new PinterestImage(url, width, height);
		return result;
	}

	static export(source: PinterestImage): PinterestImageScheme {
		const url = source.url;
		const width = source.width;
		const height = source.height;
		return { url, width, height };
	}

	get url(): string {
		return this.#url;
	}

	get width(): number {
		return this.#width;
	}

	get height(): number {
		return this.#height;
	}
}
//#endregion

//#region Pinterest images collection
export interface PinterestImagesCollectionScheme {
	"150x150"?: PinterestImageScheme;
	"400x300"?: PinterestImageScheme;
	"600x"?: PinterestImageScheme;
	"1200x"?: PinterestImageScheme;
}

export class PinterestImagesCollection {
	#thumbnail: PinterestImage | undefined;
	#feed: PinterestImage | undefined;
	#preview: PinterestImage | undefined;
	#original: PinterestImage | undefined;

	constructor(thumbnail: PinterestImage | undefined, feed: PinterestImage | undefined, preview: PinterestImage | undefined, original: PinterestImage | undefined) {
		this.#thumbnail = thumbnail;
		this.#feed = feed;
		this.#preview = preview;
		this.#original = original;
	}

	static import(source: any, name: string): PinterestImagesCollection {
		const object = Object.import(source, name);
		const thumbnail = Reflect.mapUndefined(Reflect.get(object, "150x150") as unknown, thumbnail => PinterestImage.import(thumbnail, `${name}.150x150`));
		const feed = Reflect.mapUndefined(Reflect.get(object, "400x300") as unknown, feed => PinterestImage.import(feed, `${name}.400x300`));
		const preview = Reflect.mapUndefined(Reflect.get(object, "600x") as unknown, preview => PinterestImage.import(preview, `${name}.600x`));
		const original = Reflect.mapUndefined(Reflect.get(object, "1200x") as unknown, original => PinterestImage.import(original, `${name}.1200x`));
		const result = new PinterestImagesCollection(thumbnail, feed, preview, original);
		return result;
	}

	static export(source: PinterestImagesCollection): PinterestImagesCollectionScheme {
		const thumbnail = Reflect.mapUndefined(source.thumbnail, thumbnail => PinterestImage.export(thumbnail));
		const feed = Reflect.mapUndefined(source.feed, feed => PinterestImage.export(feed));
		const preview = Reflect.mapUndefined(source.preview, preview => PinterestImage.export(preview));
		const original = Reflect.mapUndefined(source.original, original => PinterestImage.export(original));
		return { ["150x150"]: thumbnail, ["400x300"]: feed, ["600x"]: preview, ["1200x"]: original };
	}

	get thumbnail(): PinterestImage | undefined {
		return this.#thumbnail;
	}

	get feed(): PinterestImage | undefined {
		return this.#feed;
	}

	get preview(): PinterestImage | undefined {
		return this.#preview;
	}

	get original(): PinterestImage | undefined {
		return this.#original;
	}
}
//#endregion

//#region Pinterest media container
export interface PinterestMediaContainerScheme {
	media_type?: string;
	images: PinterestImagesCollectionScheme;
}

export class PinterestMediaContainer {
	#mediaType: string | undefined;
	#images: PinterestImagesCollection;

	constructor(mediaType: string | undefined, images: PinterestImagesCollection) {
		this.#mediaType = mediaType;
		this.#images = images;
	}

	static import(source: any, name: string): PinterestMediaContainer {
		const object = Object.import(source, name);
		const mediaType = Reflect.mapUndefined(Reflect.get(object, "media_type") as unknown, mediaType => String.import(mediaType, `${name}.media_type`));
		const images = PinterestImagesCollection.import(Reflect.get(object, "images"), `${name}.images`);
		const result = new PinterestMediaContainer(mediaType, images);
		return result;
	}

	static export(source: PinterestMediaContainer): PinterestMediaContainerScheme {
		const media_type = source.mediaType;
		const images = PinterestImagesCollection.export(source.images);
		return { media_type, images };
	}

	get mediaType(): string | undefined {
		return this.#mediaType;
	}

	get images(): PinterestImagesCollection {
		return this.#images;
	}
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

export class PinterestBoard {
	#id: string;
	#name: string;
	#description: string | null;
	#privacy: string;

	constructor(id: string, name: string, description: string | null, privacy: string) {
		this.#id = id;
		this.#name = name;
		this.#description = description;
		this.#privacy = privacy;
	}

	static import(source: any, name: string): PinterestBoard {
		const object = Object.import(source, name);
		const id = String.import(Reflect.get(object, "id"), `${name}.id`);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const description = Reflect.mapNull(Reflect.get(object, "description") as unknown, description => String.import(description, `${name}.description`));
		const privacy = String.import(Reflect.get(object, "privacy"), `${name}.privacy`);
		const result = new PinterestBoard(id, $name, description, privacy);
		return result;
	}

	static export(source: PinterestBoard): PinterestBoardScheme {
		const id = source.id;
		const name = source.name;
		const description = source.description;
		const privacy = source.privacy;
		return { id, name, description, privacy };
	}

	get id(): string {
		return this.#id;
	}

	get name(): string {
		return this.#name;
	}

	get description(): string | null {
		return this.#description;
	}

	get privacy(): string {
		return this.#privacy;
	}
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

export class PinterestPin {
	#id: string;
	#createdAt: string;
	#link: string | null;
	#title: string | null;
	#description: string | null;
	#altText: string | null;
	#boardId: string;
	#media: PinterestMediaContainer | null;

	constructor(id: string, createdAt: string, link: string | null, title: string | null, description: string | null, altText: string | null, boardId: string, media: PinterestMediaContainer | null) {
		this.#id = id;
		this.#createdAt = createdAt;
		this.#link = link;
		this.#title = title;
		this.#description = description;
		this.#altText = altText;
		this.#boardId = boardId;
		this.#media = media;
	}

	static import(source: any, name: string): PinterestPin {
		const object = Object.import(source, name);
		const id = String.import(Reflect.get(object, "id"), `${name}.id`);
		const createdAt = String.import(Reflect.get(object, "created_at"), `${name}.created_at`);
		const link = Reflect.mapNull(Reflect.get(object, "link")  as unknown, link => String.import(link, `${name}.link`));
		const title = Reflect.mapNull(Reflect.get(object, "title")  as unknown, title => String.import(title, `${name}.title`));
		const description = Reflect.mapNull(Reflect.get(object, "description")  as unknown, description => String.import(description, `${name}.description`));
		const altText = Reflect.mapNull(Reflect.get(object, "alt_text")  as unknown, altText => String.import(altText, `${name}.alt_text`));
		const boardId = String.import(Reflect.get(object, "board_id"), `${name}.board_id`);
		const media = Reflect.mapNull(Reflect.get(object, "media")  as unknown, media => PinterestMediaContainer.import(media, `${name}.media`));
		const result = new PinterestPin(id, createdAt, link, title, description, altText, boardId, media);
		return result;
	}

	static export(source: PinterestPin): PinterestPinScheme {
		const id = source.id;
		const created_at = source.createdAt;
		const link = source.link;
		const title = source.title;
		const description = source.description;
		const alt_text = source.altText;
		const board_id = source.boardId;
		const media = Reflect.mapNull(source.media, media => PinterestMediaContainer.export(media));
		return { id, created_at, link, title, description, alt_text, board_id, media };
	}

	get id(): string {
		return this.#id;
	}

	get createdAt(): string {
		return this.#createdAt;
	}

	get link(): string | null {
		return this.#link;
	}

	get title(): string | null {
		return this.#title;
	}

	get description(): string | null {
		return this.#description;
	}

	get altText(): string | null {
		return this.#altText;
	}

	get boardId(): string {
		return this.#boardId;
	}

	get media(): PinterestMediaContainer | null {
		return this.#media;
	}
}
//#endregion

//#region Pinterest response
export interface PinterestResponseScheme<T = any> {
	items: T[];
	bookmark: string | null;
	code?: number;
	message?: string;
}

export class PinterestResponse {
	#items: any[];
	#bookmark: string | null;
	#code: number | undefined;
	#message: string | undefined;

	constructor(items: any[], bookmark: string | null, code: number | undefined, message: string | undefined) {
		this.#items = items;
		this.#bookmark = bookmark;
		this.#code = code;
		this.#message = message;
	}

	static import(source: any, name: string): PinterestResponse {
		const object = Object.import(source, name);
		const items = Array.import(Reflect.get(object, "items"), `${name}.items`);
		const bookmark = Reflect.mapNull(Reflect.get(object, "bookmark") as unknown, bookmark => String.import(bookmark, `${name}.bookmark`));
		const code = Reflect.mapUndefined(Reflect.get(object, "code") as unknown, code => Number.import(code, `${name}.code`));
		const message = Reflect.mapUndefined(Reflect.get(object, "message") as unknown, message => String.import(message, `${name}.message`));
		const result = new PinterestResponse(items, bookmark, code, message);
		return result;
	}

	static export(source: PinterestResponse): PinterestResponseScheme {
		const items = source.items;
		const bookmark = source.bookmark;
		const code = source.code;
		const message = source.message;
		return { items, bookmark, code, message };
	}

	get items(): any[] {
		return this.#items;
	}

	get bookmark(): string | null {
		return this.#bookmark;
	}

	get code(): number | undefined {
		return this.#code;
	}

	get message(): string | undefined {
		return this.#message;
	}
}
//#endregion
