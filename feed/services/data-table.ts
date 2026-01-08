"use strict";

import "adaptive-extender/core";
import { type PortableConstructor } from "adaptive-extender/core";

//#region Data table
export interface DataTableMetadata {
	count: number;
	pages: number;
}

export abstract class DataTable<C extends PortableConstructor> extends Array<InstanceType<C>> {
	static #PAGE_COUNT: number = 100;

	constructor() {
		if (new.target === DataTable) throw new TypeError("Unable to create an instance of an abstract class");
		super();
	}

	static get [Symbol.species](): ArrayConstructor {
		return Array;
	}

	static get PAGE_COUNT(): number {
		return DataTable.#PAGE_COUNT;
	}

	static normalizePath(url: Readonly<URL>): URL {
		return url.href.endsWith("/") ? url : new URL(`${url.href}/`);
	}

	static getMetaPath(folder: URL): URL {
		return new URL("meta.json", folder);
	}

	static getFilePath(folder: URL, index: number): URL {
		return new URL(`${index}.json`, folder);
	}

	abstract load(page: number): Promise<boolean>;

	abstract save(): Promise<void>;
}
//#endregion
