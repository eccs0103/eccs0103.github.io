"use strict";

import "adaptive-extender/core";
import { Platform, type PlatformScheme } from "./platform.js";

//#region Configuration
export interface ConfigurationScheme {
	platforms: PlatformScheme[];
}

export class Configuration {
	#platforms: Platform[];

	constructor(platforms: Platform[]) {
		this.#platforms = platforms;
	}

	static import(source: any, name: string): Configuration {
		const object = Object.import(source, name);
		const platforms = Array.import(Reflect.get(object, "platforms"), `${name}.platforms`).map((item, index) => {
			return Platform.import(item, `${name}.platforms[${index}]`);
		});
		const result = new Configuration(platforms);
		return result;
	}

	static export(source: Configuration): ConfigurationScheme {
		const platforms = source.platforms.map(Platform.export);
		return { platforms };
	}

	get platforms(): Platform[] {
		return this.#platforms;
	}
}
//#endregion
