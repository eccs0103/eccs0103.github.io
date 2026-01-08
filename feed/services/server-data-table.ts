"use strict";

import "adaptive-extender/core";
import AsyncFileSystem from "fs/promises";
import { type PortableConstructor } from "adaptive-extender/core";
import { DataTable, DataTableMetadata, type DataTableMetadataScheme } from "./data-table.js";

const { ceil } = Math;

//#region Server data table
export class ServerDataTable<C extends PortableConstructor> extends DataTable<C> {
	async #fetchJson(target: URL): Promise<unknown | null> {
		try {
			const response = await AsyncFileSystem.readFile(target, "utf-8");
			return JSON.parse(response);
		} catch (error: unknown) {
			const code = Reflect.get(error as object, "code");
			if (code === "ENOENT") return null;
			throw error;
		}
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
		const start = page * limit;
		this.splice(start, limit, ...array);
		return true;
	}

	async save(): Promise<void> {
		await AsyncFileSystem.mkdir(this.path, { recursive: true });
		const limit = DataTable.PAGE_LIMIT;
		const type = this.type;
		const source = [...this].reverse();
		const count = source.length;
		const pages = count > 0 ? ceil(count / limit) : 0;
		for (let index = 0; index < pages; index++) {
			const target = this.getFilePath(index);
			const chunk = source.slice(index * limit, (index + 1) * limit);
			const array = chunk.map(item => type.export(item));
			const content = JSON.stringify(array, null, "\t");
			await AsyncFileSystem.writeFile(target, content);
		}
		const metadata: DataTableMetadataScheme = { length: pages };
		const targetMeta = this.getMetaPath();
		await AsyncFileSystem.writeFile(targetMeta, JSON.stringify(metadata, null, "\t"));
	}
}
//#endregion
