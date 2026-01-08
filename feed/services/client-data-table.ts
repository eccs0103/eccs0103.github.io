"use strict";

import "adaptive-extender/web";
import { type PortableConstructor } from "adaptive-extender/web";
import { DataTable, DataTableMetadata } from "./data-table.js";

//#region Client data table
export class ClientDataTable<C extends PortableConstructor> extends DataTable<C> {
	async #fetchJson(target: URL): Promise<unknown | null> {
		const response = await fetch(target);
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText} at ${target.href}`);
		return await response.json();
	}

	async readMetadata(): Promise<DataTableMetadata | null> {
		const target = this.getMetaPath();
		const object = await this.#fetchJson(target);
		if (object === null) return null;
		return DataTableMetadata.import(object, target.pathname);
	}

	async load(page: number): Promise<boolean> {
		const meta = await this.readMetadata();
		if (meta === null) return false;
		const { length } = meta;
		if (length < 1) return false;
		const index = this.getFileIndex(page, length);
		if (index < 0) return false;
		const target = this.getFilePath(index);
		const object = await this.#fetchJson(target);
		if (object === null) throw new Error(`Integrity error: Missing data file at ${target.href}`);
		const type = this.type;
		const { name } = type;
		const array = Array.import(object, name)
			.map((item, index) => type.import(item, `${name}[${index}]`))
			.reverse();
		const limit = DataTable.PAGE_LIMIT;
		this.splice(page * limit, limit, ...array);
		return true;
	}

	async save(): Promise<void> {
		throw new Error("Write operation is restricted in Web context");
	}
}
//#endregion
