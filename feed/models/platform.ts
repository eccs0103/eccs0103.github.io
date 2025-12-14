"use strict";

import "adaptive-extender/core";

const meta = import.meta;

//#region Platform
export interface PlatformScheme {
	name: string;
	icon: string;
	webpage: string;
	is_active: boolean;
}

export class Platform {
	#name: string;
	#icon: URL;
	#webpage: URL;
	#isActive: boolean;

	constructor(name: string, icon: URL, webpage: URL, isActive: boolean) {
		this.#name = name;
		this.#icon = icon;
		this.#webpage = webpage;
		this.#isActive = isActive;
	}

	static import(source: any, name: string): Platform {
		const object = Object.import(source, name);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const icon = new URL(String.import(Reflect.get(object, "icon"), `${name}.icon`), meta.url);
		const webpage = new URL(String.import(Reflect.get(object, "webpage"), `${name}.webpage`), meta.url);
		const isActive = Boolean.import(Reflect.get(object, "is_active"), `${name}.is_active`);
		const result = new Platform($name, icon, webpage, isActive);
		return result;
	}

	static export(source: Platform): PlatformScheme {
		const name = source.name;
		const icon = String(source.icon);
		const webpage = String(source.webpage);
		const is_active = source.isActive;
		return { name, icon, webpage, is_active };
	}

	get name(): string {
		return this.#name;
	}

	get icon(): URL {
		return this.#icon;
	}

	get webpage(): URL {
		return this.#webpage;
	}

	get isActive(): boolean {
		return this.#isActive;
	}
}
//#endregion
