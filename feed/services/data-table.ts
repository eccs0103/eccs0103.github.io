"use strict";

import "adaptive-extender/core";
import { type PortableConstructor } from "adaptive-extender/core";
import { Bridge } from "./bridge.js";

const { ceil } = Math;

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
export class DataTable<C extends PortableConstructor> extends Array<InstanceType<C>> {
	constructor(bridge: Bridge, path: URL, entity: C) {
		super();
		this.#bridge = bridge;
		this.#path = path.href.endsWith("/") ? path : new URL(`${path.href}/`);
		this.#entity = entity;
	}

	#bridge: Bridge;
	#path: URL;
	#entity: C;
	#chunk: number = 100;

	static get [Symbol.species](): ArrayConstructor {
		return Array;
	}

	#getMetadataPath(): URL {
		return new URL("meta.json", this.#path);
	}

	#getChunkPath(index: number): URL {
		return new URL(`${index}.json`, this.#path);
	}

	async #readMetadata(): Promise<DataTableMetadata | null> {
		const bridge = this.#bridge;
		const path = this.#getMetadataPath();
		const content = await bridge.read(path);
		if (content === null) {
			const meta = new DataTableMetadata(0);
			if (!await this.#writeMetadata(meta)) return null;
			return meta;
		}
		const object = JSON.parse(content);
		return DataTableMetadata.import(object, "metadata");
	}

	async #writeMetadata(meta: DataTableMetadata): Promise<boolean> {
		const bridge = this.#bridge;
		const path = this.#getMetadataPath();
		const object = DataTableMetadata.export(meta);
		const content = JSON.stringify(object, null, "\t");
		try {
			await bridge.write(path, content);
			return true;
		} catch (reason) {
			if (reason instanceof TypeError && reason.message === "Write operation is restricted in Web context") return false;
			throw reason;
		}
	}

	async load(page: number): Promise<boolean> {
		const meta = await this.#readMetadata();
		if (meta === null) return false;
		const { length } = meta;
		if (length < 1) return false;

		const index = length - 1 - page;
		if (index < 0) return false;
		const bridge = this.#bridge;
		const path = this.#getChunkPath(index);
		const content = await bridge.read(path);
		if (content === null) throw new ReferenceError(`Missing data chunk at ${path.pathname}`);
		const object = JSON.parse(content);
		const entity = this.#entity;
		const name = typename(entity);
		const array = Array.import(object, name)
			.map((item, index) => entity.import(item, `${name}[${index}]`))
			.reverse();
		const chunk = this.#chunk;
		this.splice(page * chunk, chunk, ...array);

		return true;
	}

	async save(): Promise<void> {
		// await AsyncFileSystem.mkdir(this.path, { recursive: true });
		const chunk = this.#chunk;
		const source = Array.from(this)
			.reverse();
		const length = ceil(source.length / chunk)
		const entity = this.#entity;
		const bridge = this.#bridge;
		for (let index = 0; index < length; index++) {
			const path = this.#getChunkPath(index);
			const array = source
				.slice(index * chunk, (index + 1) * chunk)
				.map(entity.export);
			const content = JSON.stringify(array, null, "\t");
			await bridge.write(path, content);
		}
		const meta = new DataTableMetadata(length);
		await this.#writeMetadata(meta);
	}
}
//#endregion
