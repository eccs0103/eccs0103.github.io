"use strict";

import "adaptive-extender/core";
import AsyncFileSystem from "fs/promises";
import { type PortableConstructor } from "adaptive-extender/core";
import { DataTable, type DataTableMetadata } from "./data-table.js";

const { ceil } = Math;

//#region Server data table
export class ServerDataTable<C extends PortableConstructor> extends DataTable<C> {
	#path: URL;
	#type: C;

	constructor(path: URL, type: C) {
		super();
		this.#path = DataTable.normalizePath(path);
		this.#type = type;
	}

	async #read(path: URL): Promise<string | null> {
		try {
			return await AsyncFileSystem.readFile(path, "utf-8");
		} catch (error: any) {
			// If file is missing, return null (graceful)
			if (error.code === "ENOENT") return null;
			// If file exists but cannot be read (permissions, etc.), throw
			throw error;
		}
	}

	async load(page: number): Promise<boolean> {
		const targetMeta = DataTable.getMetaPath(this.#path);
		const json = await this.#read(targetMeta);
		
		// Missing meta means empty table, not an error
		if (json === null) return false;

		let metadata: DataTableMetadata;
		try {
			metadata = JSON.parse(json);
		} catch {
			throw new Error(`Corrupted metadata file at ${targetMeta.href}`);
		}

		const indexFile = metadata.pages - 1 - page;
		if (indexFile < 0) return false;

		const target = DataTable.getFilePath(this.#path, indexFile);
		const text = await this.#read(target);
		
		// Missing data chunk when meta says it exists is a critical error
		if (text === null) throw new Error(`Missing data file at ${target.href}`);

		let object: any;
		try {
			object = JSON.parse(text);
		} catch {
			throw new Error(`Corrupted data file at ${target.href}`);
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
		const limit = DataTable.PAGE_COUNT;
		const type = this.#type;

		// Ensure directory exists (mkdir -p)
		await AsyncFileSystem.mkdir(this.#path, { recursive: true });

		const source = [...this].reverse();
		const count = source.length;
		// If empty, we still write 0 pages or handle it as 1 empty page? 
		// Ideally, keep it clean. If count 0, pages 0.
		const pages = count > 0 ? ceil(count / limit) : 0;

		// If pages is 0, we simply write metadata and exit loop
		for (let i = 0; i < pages; i++) {
			const target = DataTable.getFilePath(this.#path, i);
			const chunk = source.slice(i * limit, (i + 1) * limit);
			const array = chunk.map(item => type.export(item));
			const object = JSON.stringify(array, null, "\t");
			await AsyncFileSystem.writeFile(target, object);
		}

		const metadata: DataTableMetadata = { count, pages };
		const targetMeta = DataTable.getMetaPath(this.#path);
		await AsyncFileSystem.writeFile(targetMeta, JSON.stringify(metadata, null, "\t"));
	}
}
//#endregion
