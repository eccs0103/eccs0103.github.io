"use strict";

import "adaptive-extender/core";

//#region Platform
export interface PlatformScheme {
	name: string;
	icon: string;
	is_active: boolean;
}

export class Platform {
	#name: string;
	#icon: string;
	#isActive: boolean;

	constructor(name: string, icon: string, isActive: boolean) {
		this.#name = name;
		this.#icon = icon;
		this.#isActive = isActive;
	}

	static import(source: any, name: string): Platform {
		const object = Object.import(source, name);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const icon = String.import(Reflect.get(object, "icon"), `${name}.icon`);
		const isActive = Boolean.import(Reflect.get(object, "is_active"), `${name}.is_active`);
		const result = new Platform($name, icon, isActive);
		return result;
	}

	static export(source: Platform): PlatformScheme {
		const name = source.name;
		const icon = source.#icon;
		const is_active = source.isActive;
		return { name, icon, is_active };
	}

	get name(): string {
		return this.#name;
	}

	get icon(): string {
		return this.#icon;
	}

	get isActive(): boolean {
		return this.#isActive;
	}
}
//#endregion
