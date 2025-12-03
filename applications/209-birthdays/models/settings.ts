"use strict";

import "adaptive-extender/web";

//#region Settings
export interface SettingsScheme {
	selection: number;
}

export class Settings {
	#selection: number = 0;

	get selection(): number {
		return this.#selection;
	}

	set selection(value: number) {
		this.#selection = value;
	}

	static import(source: any, name: string): Settings {
		const object = Object.import(source, name);
		const selection = Reflect.get(object, "selection");
		const result = new Settings();
		if (selection !== undefined) result.selection = Number.import(selection, `${name}.selection`);
		return result;
	}
	
	static export(source: Settings): SettingsScheme {
		const selection = source.selection;
		return { selection };
	}
}
//#endregion
