"use strict";

import "adaptive-extender/web";
import { type ImportableConstructor } from "adaptive-extender/web";
import { Activity } from "../models/activity.js";

//#region Database context
export class DatabaseContext {
	#activities?: readonly Activity[];

	static async #loadTable<C extends ImportableConstructor>(path: URL, constructor: C): Promise<InstanceType<C>[]> {
		const response = await fetch(path);
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const object = await response.json();
		const name = constructor.name;
		const items = Array.import(object, name).map((item, index) => {
			return constructor.import(item, `${name}[${index++}]`);
		});
		return items;
	}

	async setup(): Promise<void> {
		this.#activities = Object.freeze(await DatabaseContext.#loadTable(new URL("../data/activity.json", import.meta.url), Activity));
	}

	get activities(): readonly Activity[] {
		if (this.#activities === undefined) throw new Error(`Context not initialized. Call 'setup' at first`);
		return this.#activities;
	}
}
//#endregion
