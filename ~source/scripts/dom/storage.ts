"use strict";

import { ArchivableInstance, ArchivablePrototype, DataPair } from "../core/extensions.js";

//#region Archive
/**
 * Represents an archive that stores data in localStorage.
 */
class Archive<T> {
	/**
	 * @param key The key to use for storing the data in localStorage.
	 * @param initial The initial data to be stored if no data exists with the provided key.
	 */
	constructor(key: string, initial: T) {
		this.#key = key;
		this.#initial = initial;

		if (localStorage.getItem(this.#key) === null) {
			this.data = this.#initial;
		}
	}
	#key: string;
	#initial: T;
	/**
	 * Gets the data stored in the archive.
	 */
	get data(): T {
		const item = localStorage.getItem(this.#key);
		if (item === null) throw new Error(`Key '${this.#key}' isn't defined`);
		return JSON.parse(item);
	}
	/**
	 * Sets the data in the archive.
	 */
	set data(value: T) {
		localStorage.setItem(this.#key, JSON.stringify(value, undefined, `\t`));
	}
	/**
	 * Resets the data in the archive to its initial value.
	 */
	reset(): void {
		this.data = this.#initial;
	}
	/**
	 * Modifies the data in the archive using the provided action.
	 * @param action The action to be applied to the data.
	 */
	change(action: (value: T) => T): void {
		this.data = action(this.data);
	}
}
//#endregion
//#region Archive manager
/**
 * Class to manage archives with archivable instances.
 * @template N The type of the archived data.
 * @template I The type of the archivable instance.
 */
class ArchiveManager<N, I extends ArchivableInstance<N>> {
	static #locked: boolean = true;
	/**
	 * Constructs a new archive manager instance.
	 * @template N
	 * @template I
	 * @template A
	 * @param path The path to the archive.
	 * @param prototype The prototype for creating instances.
	 * @param args The arguments for the constructor.
	 * @returns A promise with expected manager instance.
	 */
	static async construct<N, I extends ArchivableInstance<N>, A extends readonly any[]>(path: string, prototype: ArchivablePrototype<N, I, A>, ...args: A): Promise<ArchiveManager<N, I>> {
		ArchiveManager.#locked = false;
		const self: ArchiveManager<N, I> = new ArchiveManager();
		ArchiveManager.#locked = true;

		self.#construct = () => Reflect.construct(prototype, args);

		const archive = new Archive(path, self.#construct().export());
		const content = prototype.import(archive.data, `archive data`);
		if (!(content instanceof prototype)) throw new TypeError(`Given prototype must reconstruct own instance with import and export functions`);
		self.#content = content;

		window.addEventListener(`beforeunload`, (event) => {
			try {
				archive.data = self.#content.export();
			} catch (reason) {
				event.preventDefault();
			}
		});

		return self;
	}
	/**
	 * @throws {TypeError} If called directly.
	 */
	constructor() {
		if (ArchiveManager.#locked) throw new TypeError(`Illegal constructor`);
	}
	#construct: () => I;
	#content: I;
	/**
	 * Gets the content of the archive.
	 * @returns 
	 */
	get content(): I {
		return this.#content;
	}
	/**
	 * Reconstructs the content of the archive.
	 * @returns 
	 */
	reconstruct(): void {
		this.#content = this.#construct();
	}
}
//#endregion
//#region Database
type DatabaseStore = InstanceType<typeof Database.Store>;

/**
 * Represents a database for storing data.
 */
class Database {
	//#region Store
	/**
	 * Represents a store within a database.
	 */
	static Store = class DatabaseStore {
		static #locked: boolean = true;
		/**
		 * @param nameDatabase 
		 * @param nameStore 
		 * @returns 
		 */
		static async #newStore(nameDatabase: string, nameStore: string): Promise<DatabaseStore> {
			const database = await Database.#newDatabase(nameDatabase);
			DatabaseStore.#locked = false;
			const store = new DatabaseStore();
			DatabaseStore.#locked = true;
			store.#name = nameStore;
			store.#database = database;
			return store;
		}
		/**
		 * Opens an store in the database.
		 * @param nameDatabase The name of the database.
		 * @param nameStore The name of the store.
		 * @returns The opened store.
		 */
		static async open(nameDatabase: string, nameStore: string): Promise<DatabaseStore> {
			const store = await DatabaseStore.#newStore(nameDatabase, nameStore);
			const database = store.#database;
			if (!(await database.#openDatabaseWith(database => database.objectStoreNames.contains(nameStore)))) {
				await database.#upgradeDatabaseWith((database) => database.createObjectStore(nameStore, { autoIncrement: true }));
			}
			return store;
		}
		/**
		 * Suspends a store in the database.
		 * @param nameDatabase The name of the database.
		 * @param nameStore The name of the store.
		 * @returns A promise that resolves when the store is suspended.
		 */
		static async suspend(nameDatabase: string, nameStore: string): Promise<void> {
			const database = await Database.#newDatabase(nameDatabase);
			if (await database.#openDatabaseWith(database => database.objectStoreNames.contains(nameStore))) {
				await database.#upgradeDatabaseWith((database) => database.deleteObjectStore(nameStore));
			}
		}
		/**
		 * @throws {TypeError} If the constructor is called directly.
		 */
		constructor() {
			if (DatabaseStore.#locked) throw new TypeError(`Illegal constructor`);
		}
		#name: string;
		/**
		 * Gets the name of the store.
		 * @readonly
		 * @returns 
		 */
		get name(): string {
			return this.#name;
		}
		#database: Database;
		/**
		 * Gets the database the store belongs to.
		 * @readonly
		 * @returns 
		 */
		get database(): Database {
			return this.#database;
		}
		/**
		 * @template T
		 * @param action 
		 * @returns 
		 */
		#openStoreWith<T>(action: (idbos: IDBObjectStore) => T | PromiseLike<T>): Promise<T> {
			return this.#database.#openDatabaseWith(async (idb) => {
				const idbos = idb.transaction([this.#name], `readwrite`).objectStore(this.#name);
				const result = await action(idbos);
				idbos.transaction.commit();
				return result;
			});
		}
		/**
		 * Inserts values into the store.
		 * @param values The values to insert.
		 * @returns The keys of the inserted values.
		 */
		insert(...values: any[]): Promise<number[]> {
			return this.#openStoreWith(async (idbos) => {
				const keys = new Array<number>();
				for (const value of values) {
					keys.push(Number(await Database.#resolve(idbos.add(value))));
				}
				return keys;
			});
		}
		/**
		 * Selects values from the store by keys.
		 * @param keys The keys of the values to select.
		 * @returns The selected values.
		 */
		select(...keys: number[]): Promise<any[]> {
			return this.#openStoreWith(async (idbos) => {
				const values = new Array<any>();
				for (const key of keys) {
					values.push(await Database.#resolve(idbos.get(Number(key))));
				}
				return values;
			});
		}
		/**
		 * Updates values in the store.
		 * @param pairs The key-value pairs to update.
		 * @returns 
		 */
		update(...pairs: DataPair<number, any>[]): Promise<void> {
			return this.#openStoreWith(async (idbos) => {
				for (const { value, key } of pairs) {
					await Database.#resolve(idbos.put(value, key));
				}
			});
		}
		/**
		 * Removes values from the store by keys.
		 * @param keys The keys of the values to remove.
		 * @returns 
		 */
		remove(...keys: number[]): Promise<void> {
			return this.#openStoreWith(async (idbos) => {
				for (const key of keys) {
					await Database.#resolve(idbos.delete(key));
				}
			});
		}
		/**
		 * Suspends the store.
		 * @returns 
		 */
		suspend(): Promise<void> {
			return Database.Store.suspend(this.#database.name, this.#name);
		}
	};
	//#endregion

	/**
	 * @template T
	 * @param request 
	 * @returns 
	 */
	static #resolve<T>(request: IDBRequest<T>): Promise<T> {
		return Promise.withSignal((signal, resolve, reject) => {
			request.addEventListener(`success`, (event) => resolve(request.result), { signal });
			request.addEventListener(`error`, (event) => reject(request.error), { signal });
		});
	}
	static #locked: boolean = true;
	/**
	 * @param nameDatabase 
	 * @returns 
	 */
	static async #newDatabase(nameDatabase: string): Promise<Database> {
		Database.#locked = false;
		const database = new Database();
		Database.#locked = true;
		database.#name = nameDatabase;
		database.#version = await Database.#getVersion(nameDatabase);
		return database;
	}
	/**
	 * @param nameDatabase 
	 * @returns 
	 */
	static async #getVersion(nameDatabase: string): Promise<number> {
		for (const { name, version } of await indexedDB.databases()) {
			if (name === nameDatabase && version !== undefined) return version;
		}
		return 0;
	}
	/**
	 * Opens an existing database.
	 * @param nameDatabase The name of the database.
	 * @returns The opened database.
	 */
	static async open(nameDatabase: string): Promise<Database> {
		const database = await Database.#newDatabase(nameDatabase);
		await database.#openDatabaseWith((database) => database);
		return database;
	}
	/**
	 * Suspends (deletes) a database.
	 * @param nameDatabase The name of the database.
	 * @returns 
	 */
	static async suspend(nameDatabase: string): Promise<void> {
		return Promise.withSignal((signal, resolve, reject) => {
			const requestIDBOpen = indexedDB.deleteDatabase(nameDatabase);
			requestIDBOpen.addEventListener(`success`, (event) => resolve(), { signal });
			requestIDBOpen.addEventListener(`error`, (event) => reject(requestIDBOpen.error), { signal });
		});
	}
	/**
	 * Gets a list of all databases.
	 * @readonly
	 * @returns 
	 */
	static get databases(): Promise<Readonly<string[]>> {
		return new Promise(async (resolve) => {
			const databases = [];
			for (const { name } of await indexedDB.databases()) {
				if (name === undefined) continue;
				databases.push(name);
			}
			resolve(Object.freeze(databases));
		});
	}
	/**
	 * @throws {TypeError} If the constructor is called directly.
	 */
	constructor() {
		if (Database.#locked) throw new TypeError(`Illegal constructor`);
	}
	#name: string;
	/**
	 * Gets the name of the database.
	 * @readonly
	 * @returns 
	 */
	get name(): string {
		return this.#name;
	}
	#version: number;
	/**
	 * @template T
	 * @param action 
	 * @returns 
	 */
	#upgradeDatabaseWith<T>(action: (idb: IDBDatabase) => T): Promise<T> {
		return Promise.withSignal(async (signal, resolve, reject) => {
			const requestIDBOpen = indexedDB.open(this.#name, ++this.#version);
			requestIDBOpen.addEventListener(`upgradeneeded`, (event) => {
				const idb = requestIDBOpen.result;
				const result = action(idb);
				idb.close();
				resolve(result);
			}, { signal });
			requestIDBOpen.addEventListener(`blocked`, (event) => reject(requestIDBOpen.error), { signal });
		});
	}
	/**
	 * @template T
	 * @param action 
	 * @returns 
	 */
	#openDatabaseWith<T>(action: (idb: IDBDatabase) => T | PromiseLike<T>): Promise<T> {
		if (this.#version < 1) this.#upgradeDatabaseWith((idb) => idb);
		return Promise.withSignal((signal, resolve, reject) => {
			const requestIDBOpen = indexedDB.open(this.#name);
			requestIDBOpen.addEventListener(`success`, async (event) => {
				const idb = requestIDBOpen.result;
				const result = await action(idb);
				idb.close();
				resolve(result);
			}, { signal });
			requestIDBOpen.addEventListener(`error`, (event) => reject(requestIDBOpen.error), { signal });
		});
	}
	/**
	 * Gets a list of all stores in the database.
	 * @readonly
	 * @returns 
	 */
	get stores(): Promise<Readonly<string[]>> {
		return this.#openDatabaseWith((database) => Object.freeze(Array.from(database.objectStoreNames)));
	}
	/**
	 * Suspends the database.
	 * @returns 
	 */
	suspend(): Promise<void> {
		return Database.suspend(this.#name);
	}
}
//#endregion

export { Archive, ArchiveManager, Database };
