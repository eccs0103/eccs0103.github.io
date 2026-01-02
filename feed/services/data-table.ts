"use strict";

import "adaptive-extender/core";
import { ImplementationError, type PortableConstructor } from "adaptive-extender/core";

//#region Data table
export abstract class DataTable<C extends PortableConstructor> extends Array<InstanceType<C>> {
	static #patternJSONExtension: RegExp = /\.json$/;
	static #PAGE_COUNT: number = 100;

	constructor() {
		if (new.target === DataTable) throw new TypeError("Unable to create an instance of an abstract class");
		super();
	}

	static toPaginatedPath(path: Readonly<URL>, page: number): URL {
		return new URL(path.href.replace(DataTable.#patternJSONExtension, extension => `-${page}${extension}`));
	}

	static get PAGE_COUNT(): number {
		return DataTable.#PAGE_COUNT;
	}

	load(page: number): Promise<boolean> {
		throw new ImplementationError();
	}

	save(): Promise<void> {
		throw new ImplementationError();
	}
}
//#endregion
