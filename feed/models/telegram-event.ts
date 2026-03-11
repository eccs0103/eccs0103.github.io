"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Model, Optional, UnixSeconds } from "adaptive-extender/core";

//#region Telegram photo size
export class TelegramPhotoSize extends Model {
	@Field(String, "file_id")
	fileId: string;

	@Field(Number, "width")
	width: number;

	@Field(Number, "height")
	height: number;
}
//#endregion

//#region Telegram audio
export class TelegramAudio extends Model {
	@Field(String, "file_id")
	fileId: string;

	@Field(Optional(String), "title")
	title: string | undefined;

	@Field(Optional(String), "performer")
	performer: string | undefined;

	@Field(Number, "duration")
	duration: number;
}
//#endregion

//#region Telegram video
export class TelegramVideo extends Model {
	@Field(String, "file_id")
	fileId: string;

	@Field(Number, "duration")
	duration: number;

	@Field(Optional(TelegramPhotoSize), "thumbnail")
	thumbnail: TelegramPhotoSize | undefined;
}
//#endregion

//#region Telegram document
export class TelegramDocument extends Model {
	@Field(String, "file_id")
	fileId: string;

	@Field(Optional(String), "file_name")
	fileName: string | undefined;

	@Field(Optional(String), "mime_type")
	mimeType: string | undefined;
}
//#endregion

//#region Telegram chat
export class TelegramChat extends Model {
	@Field(Number, "id")
	id: number;

	@Field(Optional(String), "username")
	username: string | undefined;
}
//#endregion

//#region Telegram channel post
export class TelegramChannelPost extends Model {
	@Field(Number, "message_id")
	messageId: number;

	@Field(TelegramChat, "chat")
	chat: TelegramChat;

	@Field(UnixSeconds, "date")
	date: Date;

	@Field(Optional(String), "text")
	text: string | undefined;

	@Field(Optional(String), "caption")
	caption: string | undefined;

	@Field(Optional(ArrayOf(TelegramPhotoSize)), "photo")
	photo: TelegramPhotoSize[] | undefined;

	@Field(Optional(TelegramAudio), "audio")
	audio: TelegramAudio | undefined;

	@Field(Optional(TelegramVideo), "video")
	video: TelegramVideo | undefined;

	@Field(Optional(TelegramDocument), "document")
	document: TelegramDocument | undefined;
}
//#endregion

//#region Telegram update
export class TelegramUpdate extends Model {
	@Field(Number, "update_id")
	updateId: number;

	@Field(Optional(TelegramChannelPost), "channel_post")
	channelPost: TelegramChannelPost | undefined;
}
//#endregion
