"use strict";

import "adaptive-extender/web";

//#region Settings
interface SettingsScheme {
	selection: number;
}

class Settings {
	#selection: number = 0;

	get selection(): number {
		return this.#selection;
	}

	set selection(value: number) {
		this.#selection = value;
	}

	static import(source: any, name: string = "[source]"): Settings {
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

export { type SettingsScheme, Settings };
