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
	name: string;
	icon: string;
	webpage: string;
	isActive: boolean;

	constructor(name: string, icon: string, webpage: string, isActive: boolean) {
		this.name = name;
		this.icon = icon;
		this.webpage = webpage;
		this.isActive = isActive;
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
}
//#endregion
//#region Configuration
export interface ConfigurationScheme {
	platforms: PlatformScheme[];
	intro: string;
	outro: string;
}

export class Configuration {
	platforms: Platform[];
	intro: string;
	outro: string;

	constructor(platforms: Platform[], intro: string, outro: string) {
		this.platforms = platforms;
		this.intro = intro;
		this.outro = outro;
	}

	static import(source: any, name: string): Configuration {
		const object = Object.import(source, name);
		const platforms = Array.import(Reflect.get(object, "platforms"), `${name}.platforms`).map((item, index) => {
			return Platform.import(item, `${name}.platforms[${index}]`);
		});
		const intro = String.import(Reflect.get(object, "intro"), `${name}.intro`);
		const outro = String.import(Reflect.get(object, "outro"), `${name}.outro`);
		const result = new Configuration(platforms, intro, outro);
		return result;
	}

	static export(source: Configuration): ConfigurationScheme {
		const platforms = source.platforms.map(Platform.export);
		const intro = source.intro;
		const outro = source.outro;
		return { platforms, intro, outro };
	}
}
//#endregion
