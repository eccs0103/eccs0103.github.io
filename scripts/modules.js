//#region Random
/**
 * A class that manages with randomness.
 */
class Random {
	/**
	 * Gives a random number between min and max exclusively.
	 * @param {Number} min A minimum value.
	 * @param {Number} max A maximum value.
	 * @returns A random float float.
	 */
	static number(min, max) {
		return Math.random() * (max - min) + min;
	}
	/**
	 * Gives a random element from an array.
	 * @template Item Item type.
	 * @param {Array<Item>} array Given array.
	 * @returns An array element.
	 */
	static element(array) {
		return array[Math.floor(Random.number(0, array.length))];
	}
	/**
	 * A function that returns random element from cases.
	 * @template Item Item type.
	 * @param {Map<Item, Number>} cases Map of cases.
	 * @returns Random element.
	 */
	static case(cases) {
		const list = Array.from(cases);
		const random = Random.number(0, list.reduce((previous, [item, chance]) => previous + chance, 0));
		let selection = undefined;
		let start = 0;
		for (const [item, chance] of list) {
			const end = start + chance;
			if (start <= random && random < end) {
				selection = item;
				break;
			}
			start = end;
		}
		if (selection === undefined) {
			throw new ReferenceError(`Can't select value. Maybe stack is empty.`);
		}
		return selection;
	}
}
//#endregion
//#region Archive
/**
 * A class for convenient data storage in local storage.
 * @template Notation Data type stored in archive.
 */
class Archive {
	/**
	 * @param {String} path The path where the data should be stored.
	 * @param {Notation?} initial Initial data.
	 */
	constructor(path, initial = null) {
		this.#path = path;
		if (!localStorage.getItem(path) && initial) {
			localStorage.setItem(path, JSON.stringify(initial, undefined, `\t`));
		}
	}
	/** @type {String} */ #path;
	/**
	 * The data stored in the archive.
	 */
	get data() {
		const item = localStorage.getItem(this.#path);
		if (!item) {
			throw new ReferenceError(`Key '${this.#path}' isn't defined.`);
		}
		return (/** @type {Notation} */ (JSON.parse(item)));
	}
	/**
	 * The data stored in the archive.
	 */
	set data(value) {
		localStorage.setItem(this.#path, JSON.stringify(value, undefined, `\t`));
	}
	/**
	 * Function for receiving and transmitting data. Frequent use is not recommended based on optimization.
	 * @param {(value: Notation) => Notation} action A function that transforms the results.
	 */
	change(action) {
		this.data = action(this.data);
	}
}
//#endregion
