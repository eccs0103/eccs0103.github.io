"use strict";

import "adaptive-extender/web";
import { type PortableConstructor } from "adaptive-extender/web";
import { DataTable, type DataTableMetadata } from "./data-table.js";

//#region Client data table
export class ClientDataTable<C extends PortableConstructor> extends DataTable<C> {
	#path: URL;
	#type: C;
	#metadata: DataTableMetadata | null = null;

	constructor(path: URL, type: C) {
		super();
		this.#path = DataTable.normalizePath(path);
		this.#type = type;
	}

	async load(page: number): Promise<boolean> {
		if (this.#metadata === null) {
			const targetMeta = DataTable.getMetaPath(this.#path);
			const responseMeta = await fetch(targetMeta);
			
			// 404 implies empty table, strictly adhere to non-throwing on missing
			if (responseMeta.status === 404) return false;
			if (!responseMeta.ok) throw new Error(`Failed to fetch metadata: ${responseMeta.statusText}`);
			
			try {
				this.#metadata = await responseMeta.json();
			} catch {
				throw new Error("Invalid JSON in metadata");
			}
		}

		const metadata = this.#metadata!;
		if (metadata.pages === 0) return false;

		const indexFile = metadata.pages - 1 - page;
		if (indexFile < 0) return false;

		const target = DataTable.getFilePath(this.#path, indexFile);
		const response = await fetch(target);
		
		if (!response.ok) throw new Error(`Failed to fetch data chunk ${indexFile}: ${response.statusText}`);

		let object: any;
		try {
			object = await response.json();
		} catch {
			throw new Error("Invalid JSON in data chunk");
		}

		const type = this.#type;
		const { name } = type;

		const array = Array.import(object, name)
			.map((item, index) => type.import(item, `${name}[${index}]`))
			.reverse();

		const limit = DataTable.PAGE_COUNT;
		this.splice(page * limit, limit, ...array);
		return true;
	}

	async save(): Promise<void> {
		throw new Error("Write operation is restricted in Web context");
	}
}
//#endregion
