"use strict";

const { random, trunc } = Math;

//#region Random
/**
 * Random values generator.
 */
class Random {
	static #global: Random = new Random();
	/**
	 * The global instance.
	 * @readonly
	 */
	static get global(): Random {
		return Random.#global;
	}
	/**
	 * Generates a random boolean value.
	 * @param factor Probability for `true` (0 to 1, default is 0.5).
	 * @returns Random boolean value.
	 * @throws {TypeError} If factor is not finite.
	 * @throws {RangeError} If factor is out of range.
	 */
	boolean(factor: number = 0.5): boolean {
		if (!Number.isFinite(factor)) throw new TypeError(`The factor $must be a finite number`);
		if (0 > factor || factor > 1) throw new RangeError(`The factor ${factor} is out of range [0 - 1]`);
		return random() < factor;
	}
	/**
	 * Returns a random number in range [min - max).
	 * @param min The minimum value.
	 * @param max The maximum value.
	 * @returns A random number.
	 */
	number(min: number, max: number): number {
		return random() * (max - min) + min;
	}
	/**
	 * Returns a random integer in range [min - max).
	 * @param min The minimum value.
	 * @param max The maximum value.
	 * @returns A random integer.
	 */
	integer(min: number, max: number): number {
		return trunc(this.number(min, max));
	}
	/**
	 * Returns a random element from an array.
	 * @param array The array of elements.
	 * @returns A random element.
	 * @throws {Error} If the array is empty.
	 */
	item<T>(array: readonly T[]): T {
		if (1 > array.length) throw new Error(`Array must have at least 1 item`);
		return array[this.integer(0, array.length)];
	}
	/**
	 * Generates a range of random numbers from min to max (exclusive).
	 * @param min The minimum value.
	 * @param max The maximum value.
	 * @returns An array of random numbers.
	 */
	range(min: number, max: number): number[] {
		const array = Array.range(min, max);
		this.shuffle(array);
		return array;
	}
	/**
	 * Returns a random subarray of elements from an array.
	 * @param array The array of elements.
	 * @param count The number of elements to select.
	 * @returns A random subarray of elements.
	 * @throws {TypeError} If count is not a finite integer.
	 * @throws {RangeError} If count is less than 0 or greater than array length.
	 */
	subarray<T>(array: readonly T[], count: number = 1): T[] {
		if (!Number.isInteger(count)) throw new TypeError(`The count $must be a finite integer number`);
		if (0 > count || count > array.length) throw new RangeError(`The count $is out of range [0 - $]`);
		const clone = Array.from(array);
		const subarray = [];
		for (let index = 0; index < count; index++) {
			subarray.push(...clone.splice(this.integer(0, clone.length), 1));
		}
		return subarray;
	}
	/**
	 * Shuffles the elements of an array in place using the Fisher-Yates algorithm.
	 * @param array The array to shuffle.
	 */
	shuffle<T>(array: T[]): void {
		for (let index = 0; index < array.length - 1; index++) {
			const pair = this.integer(index, array.length);
			if (pair === index) continue;
			array.swap(index, pair);
		}
	}
	/**
	 * Selects a random element from a list according to their weights.
	 * @param cases The map with elements and their weights.
	 * @returns A random element.
	 * @throws {RangeError} If the map is empty.
	 */
	case<T>(cases: Readonly<Map<T, number>>): T {
		if (1 > cases.size) throw new RangeError(`The cases must have at least 1 item`);
		const summary = Array.from(cases).reduce((previous, [, weight]) => previous + weight, 0);
		const random = this.number(0, summary);
		let begin = 0;
		for (const [item, weight] of cases) {
			const end = begin + weight;
			if (begin <= random && random < end) {
				return item;
			}
			begin = end;
		}
		throw new Error(`Unable to select element with value ${random}`);
	};
}
//#endregion

export { Random };
