"use strict";

import "adaptive-extender/web";
import { type PortableConstructor } from "adaptive-extender/web";
import { type DataTable } from "./data-table.js";

//#region Client data table
export class ClientDataTable<C extends PortableConstructor> extends Array<InstanceType<C>> implements DataTable<C> {
	#path: URL;
	#type: C;

	constructor(path: URL, type: C) {
		super();
		this.#path = path;
		this.#type = type;
	}

	async load(): Promise<void> {
		const response = await fetch(this.#path);
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const object = await response.json();
		const type = this.#type;
		const { name } = type;
		const array = Array.import(object, name).map((item, index) => type.import(item, `${name}[${index}]`));
		this.splice(0, this.length, ...array);
	}

	async save(): Promise<void> {
		throw new Error("Write operation is restricted in Web context");
	}
}
//#endregion
