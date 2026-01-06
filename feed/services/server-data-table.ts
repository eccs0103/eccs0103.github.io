"use strict";

import "adaptive-extender/core";
import AsyncFileSystem from "fs/promises";
import { type PortableConstructor } from "adaptive-extender/core";
import { DataTable } from "./data-table.js";

const { ceil } = Math;

//#region Server data table
export class ServerDataTable<C extends PortableConstructor> extends DataTable<C> {
	#path: URL;
	#type: C;

	constructor(path: URL, type: C) {
		super();
		this.#path = path;
		this.#type = type;
	}

	async #read(path: URL): Promise<string | null> {
		try {
			return await AsyncFileSystem.readFile(path, "utf-8");
		} catch {
			return null;
		}
	}

	async load(page: number): Promise<boolean> {
		const limit = DataTable.PAGE_COUNT;
		const target = DataTable.toPaginatedPath(this.#path, page);
		const text = await this.#read(target);
		if (text === null) return false;
		const object = JSON.parse(text);
		const type = this.#type;
		const { name } = type;
		const array = Array.import(object, name).map((item, index) => type.import(item, `${name}[${index}]`));
		this.splice(page * limit, limit, ...array);
		return true;
	}

	async save(): Promise<void> {
		const limit = DataTable.PAGE_COUNT;
		const type = this.#type;
		for (let page = 0; page < ceil(this.length / limit); page++) {
			const target = DataTable.toPaginatedPath(this.#path, page);
			const chunk = this.slice(page * limit, (page + 1) * limit);
			const array = chunk.map(item => type.export(item));
			const object = JSON.stringify(array, null, "\t");
			await AsyncFileSystem.writeFile(target, object);
		}
	}
}
//#endregion
