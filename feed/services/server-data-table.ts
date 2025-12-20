"use strict";

import "adaptive-extender/core";
import AsyncFileSystem from "fs/promises";
import { type PortableConstructor } from "adaptive-extender/core";
import { type DataTable } from "./data-table.js";

//#region Server data table
export class ServerDataTable<C extends PortableConstructor> extends Array<InstanceType<C>> implements DataTable<C> {
	#path: URL;
	#type: C;

	constructor(path: URL, type: C) {
		super();
		this.#path = path;
		this.#type = type;
	}

	async load(): Promise<void> {
		const path = this.#path;
		await AsyncFileSystem.mkdir(new URL(".", path), { recursive: true });
		const text = await AsyncFileSystem.readFile(path, "utf-8");
		const object = JSON.parse(text);
		const type = this.#type;
		const { name } = type;
		const array = Array.import(object, name).map((item, index) => type.import(item, `${name}[${index}]`));
		this.splice(0, this.length, ...array);
	}

	async save(): Promise<void> {
		const type = this.#type;
		const array = this.map(item => type.export(item));
		const object = JSON.stringify(array, null, "\t");
		await AsyncFileSystem.writeFile(this.#path, object);
	}
}
//#endregion
