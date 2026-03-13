"use strict";

import "adaptive-extender/core";
import { Field, Model, Optional } from "adaptive-extender/core";

//#region Telegram file
export interface TelegramFileScheme {
	file_id: string;
	file_path?: string;
}

export class TelegramFile extends Model {
	@Field(String, "file_id")
	fileId: string;

	@Field(Optional(String), "file_path")
	filePath?: string;
}
//#endregion

//#region Telegram get file response
export interface TelegramGetFileResponseScheme {
	ok: boolean;
	result?: TelegramFileScheme;
	description?: string;
}

export class TelegramGetFileResponse extends Model {
	@Field(Boolean, "ok")
	ok: boolean;

	@Field(Optional(TelegramFile), "result")
	result?: TelegramFile;

	@Field(Optional(String), "description")
	description?: string;
}
//#endregion
