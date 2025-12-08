"use strict";

import "adaptive-extender/core";

const meta = import.meta;

//#region Platform
export interface PlatformScheme {
	name: string;
	icon: string;
	is_active: boolean;
}

export class Platform {
	#name: string;
	#icon: URL;
	#isActive: boolean;

	constructor(name: string, icon: URL, isActive: boolean) {
		this.#name = name;
		this.#icon = icon;
		this.#isActive = isActive;
	}

	static import(source: any, name: string): Platform {
		const object = Object.import(source, name);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const icon = new URL(String.import(Reflect.get(object, "icon"), `${name}.icon`), meta.url);
		const isActive = Boolean.import(Reflect.get(object, "is_active"), `${name}.is_active`);
		const result = new Platform($name, icon, isActive);
		return result;
	}

	static export(source: Platform): PlatformScheme {
		const name = source.name;
		const icon = String(source.#icon);
		const is_active = source.isActive;
		return { name, icon, is_active };
	}

	get name(): string {
		return this.#name;
	}

	get icon(): URL {
		return this.#icon;
	}

	get isActive(): boolean {
		return this.#isActive;
	}
}
//#endregion
