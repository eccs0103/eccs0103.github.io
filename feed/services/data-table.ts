"use strict";

import "adaptive-extender/core";
import { type PortableConstructor } from "adaptive-extender/core";

//#region Data table metadata
export interface DataTableMetadataScheme {
	length: number;
}

export class DataTableMetadata {
	#length: number;

	constructor(length: number) {
		this.#length = length;
	}

	static import(source: any, name: string): DataTableMetadata {
		const object = Object.import(source, name);
		const length = Number.import(Reflect.get(object, "length"), `${name}.length`);
		const result = new DataTableMetadata(length);
		return result;
	}

	static export(source: DataTableMetadata): DataTableMetadataScheme {
		const length = source.length;
		return { length };
	}

	get length(): number {
		return this.#length;
	}
}
//#endregion
//#region Data table
export abstract class DataTable<C extends PortableConstructor> extends Array<InstanceType<C>> {
	static #PAGE_LIMIT: number = 100;
	#path: URL;
	#type: C;

	constructor(path: Readonly<URL>, type: C) {
		if (new.target === DataTable) throw new TypeError("Unable to create an instance of an abstract class");
		super();
		this.#path = path.href.endsWith("/") ? path : new URL(`${path.href}/`);
		this.#type = type;
	}

	static get [Symbol.species](): ArrayConstructor {
		return Array;
	}

	static get PAGE_LIMIT(): number {
		return DataTable.#PAGE_LIMIT;
	}

	get path(): URL {
		return this.#path;
	}

	get type(): C {
		return this.#type;
	}

	getMetaPath(): URL {
		return new URL("meta.json", this.#path);
	}

	getFilePath(index: number): URL {
		return new URL(`${index}.json`, this.#path);
	}

	getFileIndex(page: number, length: number): number {
		return length - 1 - page;
	}

	abstract readMetadata(): Promise<DataTableMetadata | null>;

	abstract load(page: number): Promise<boolean>;

	abstract save(): Promise<void>;
}
//#endregion
