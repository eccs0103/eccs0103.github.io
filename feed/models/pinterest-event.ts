"use strict";

import "adaptive-extender/core";

//#region Pinterest image
/**
 * Единичный объект изображения.
 */
export interface PinterestImageScheme {
	url: string;
	width: number;
	height: number;
}

export class PinterestImage {
	static import(source: any, name: string): PinterestImage {
		const object = Object.import(source, name);
		const result = new PinterestImage();
		return result;
	}

	// static export(source: PinterestImage): PinterestImageScheme {
	// 	return {};
	// }
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
	static import(source: any, name: string): PinterestImagesCollection {
		const object = Object.import(source, name);
		const result = new PinterestImagesCollection();
		return result;
	}

	static export(source: PinterestImagesCollection): PinterestImagesCollectionScheme {
		return {};
	}
}
//#endregion
//#region Pinterest media container
/**
 * Объект медиа (картинки/видео).
 * Ключи разрешений (150x150 и т.д.) помечены как Optional (?), 
 * потому что API Pinterest НЕ гарантирует наличие всех размеров для старых картинок.
 */
export interface PinterestMediaContainerScheme {
	/**
	 * Тип медиа. 
	 * @undefined Обычно означает "image" (для старых пинов).
	 */
	media_type?: "image" | "video";
	images: PinterestImagesCollectionScheme;
}

export class PinterestMediaContainer {
	static import(source: any, name: string): PinterestMediaContainer {
		const object = Object.import(source, name);
		const result = new PinterestMediaContainer();
		return result;
	}

	// static export(source: PinterestMediaContainer): PinterestMediaContainerScheme {
	// 	return {};
	// }
}
//#endregion
//#region Pinterest owner
interface PinterestOwnerScheme {
	username: string;
}
//#endregion
//#region Pinterest board
/**
 * Объект доски (Board).
 * @see https://developers.pinterest.com/docs/api/v5/#operation/boards/list
 */
export interface PinterestBoardScheme {
	id: string;
	name: string;
	description: string | null;
	owner: PinterestOwnerScheme;
	privacy: "PUBLIC" | "PROTECTED" | "SECRET";
}

export class PinterestBoard {
	static import(source: any, name: string): PinterestBoard {
		const object = Object.import(source, name);
		const result = new PinterestBoard();
		return result;
	}

	// static export(source: PinterestBoard): PinterestBoardScheme {
	// 	return {};
	// }
}
//#endregion
//#region Pinterest pin
/**
 * Объект пина (Pin).
 * @see https://developers.pinterest.com/docs/api/v5/#operation/boards/list_pins
 */
export interface PinterestPinScheme {
	id: string;
	created_at: string;
	
	/**
	 * Ссылка на источник (сайт).
	 * @null Если загружено с компьютера или ссылка битая.
	 */
	link: string | null;
	
	title: string | null;
	description: string | null;
	
	/**
	 * Текст для Accessibility. Часто отсутствует.
	 */
	alt_text: string | null;
	
	board_id: string;
	
	/**
	 * Медиа контент.
	 * @null Может прийти null, если контент удален модерацией, но метаданные остались.
	 */
	media: PinterestMediaContainerScheme | null;
}

export class PinterestPin {
	static import(source: any, name: string): PinterestPin {
		const object = Object.import(source, name);
		const result = new PinterestPin();
		return result;
	}

	// static export(source: PinterestPin): PinterestPinScheme {
	// 	return { };
	// }
}
//#endregion
//#region Pinterest response
/**
 * Стандартная обертка ответа API v5 с пагинацией.
 */
export interface PinterestResponseScheme<T> {
	items: T[];
	
	/**
	 * Токен для следующей страницы.
	 * @null Если страницы кончились.
	 */
	bookmark: string | null;
	
	/**
	 * Код ошибки (если есть).
	 * @undefined При успешном запросе.
	 */
	code?: number;
	
	/**
	 * Текст ошибки.
	 * @undefined При успешном запросе.
	 */
	message?: string;
}

export class PinterestResponse {
	static import(source: any, name: string): PinterestResponse {
		const object = Object.import(source, name);
		const result = new PinterestResponse();
		return result;
	}

	// static export(source: PinterestResponse): PinterestResponseScheme {
	// 	return { };
	// }
}
//#endregion
