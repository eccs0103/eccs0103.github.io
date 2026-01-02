"use strict";

import "adaptive-extender/web";
import { type PortableConstructor } from "adaptive-extender/web";
import { DataTable } from "./data-table.js";

//#region Client data table
export class ClientDataTable<C extends PortableConstructor> extends DataTable<C> {
	#path: URL;
	#type: C;

	constructor(path: URL, type: C) {
		super();
		this.#path = path;
		this.#type = type;
	}

	async load(page: number): Promise<boolean> {
		const limit = DataTable.PAGE_COUNT;
		const target = DataTable.toPaginatedPath(this.#path, page);
		const response = await fetch(target);
		if (!response.ok) return false;
		const object = await response.json();
		const type = this.#type;
		const { name } = type;
		const array = Array.import(object, name).map((item, index) => type.import(item, `${name}[${index}]`));
		this.splice(page * limit, limit, ...array);
		return true;
	}

	async save(): Promise<void> {
		throw new Error("Write operation is restricted in Web context");
	}
}
//#endregion
