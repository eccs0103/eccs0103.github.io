"use strict";

import "adaptive-extender/core";

//#region Platform
export interface PlatformScheme {
	name: string;
	icon: string;
	webpage: string;
	is_active: boolean;
}

export class Platform {
	#name: string;
	#icon: string;
	#webpage: string;
	#isActive: boolean;

	constructor(name: string, icon: string, webpage: string, isActive: boolean) {
		this.#name = name;
		this.#icon = icon;
		this.#webpage = webpage;
		this.#isActive = isActive;
	}

	static import(source: any, name: string): Platform {
		const object = Object.import(source, name);
		const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
		const icon = String.import(Reflect.get(object, "icon"), `${name}.icon`);
		const webpage = String.import(Reflect.get(object, "webpage"), `${name}.webpage`);
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

	get icon(): string {
		return this.#icon;
	}

	get webpage(): string {
		return this.#webpage;
	}

	get isActive(): boolean {
		return this.#isActive;
	}
}
//#endregion
//#region Configuration
export interface ConfigurationScheme {
	platforms: PlatformScheme[];
	begin_message: string;
	end_message: string;
}

export class Configuration {
	#platforms: Platform[];
	#beginMessage: string;
	#endMessage: string;

	constructor(platforms: Platform[], beginMessage: string, endMessage: string) {
		this.#platforms = platforms;
		this.#beginMessage = beginMessage;
		this.#endMessage = endMessage;
	}

	static import(source: any, name: string): Configuration {
		const object = Object.import(source, name);
		const platforms = Array.import(Reflect.get(object, "platforms"), `${name}.platforms`).map((item, index) => {
			return Platform.import(item, `${name}.platforms[${index}]`);
		});
		const beginMessage = String.import(Reflect.get(object, "begin_message"), `${name}.begin_message`);
		const endMessage = String.import(Reflect.get(object, "end_message"), `${name}.end_message`);
		const result = new Configuration(platforms, beginMessage, endMessage);
		return result;
	}

	static export(source: Configuration): ConfigurationScheme {
		const platforms = source.platforms.map(Platform.export);
		const begin_message = source.beginMessage;
		const end_message = source.endMessage;
		return { platforms, begin_message, end_message };
	}

	get platforms(): Platform[] {
		return this.#platforms;
	}

	get beginMessage(): string {
		return this.#beginMessage;
	}

	get endMessage(): string {
		return this.#endMessage;
	}
}
//#endregion
