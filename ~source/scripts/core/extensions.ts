"use strict";

const { PI, trunc, pow } = Math;

/**
 * A mapping interface that associates primitive types with string keys.
 * This is used to handle conversions to different primitive types.
 */
interface PrimitivesHintMap {
	"number": number;
	"boolean": boolean;
	"string": string;
}

//#region Number
declare global {
	interface NumberConstructor {
		/**
		 * Imports a number from a source.
		 * @param source The source value to import.
		 * @param name The name of the source value.
		 * @returns The imported number value.
		 * @throws {ReferenceError} If the source is undefined.
		 * @throws {TypeError} If the source is not a number.
		 */
		import(source: any, name?: string): number;
	}

	interface Number {
		/**
		 * Exports the number value.
		 * @returns The exported number value.
		 */
		export(): number;
		/**
		 * Clamps a value between a minimum and maximum.
		 * @param min The minimum value.
		 * @param max The maximum value.
		 * @returns The clamped value.
		 */
		clamp(min: number, max: number): number;
		/**
		 * Interpolates the number from one range to another.
		 * @param min1 The minimum value of the original range.
		 * @param max1 The maximum value of the original range.
		 * @param min2 The minimum value of the target range. Defaults to 0.
		 * @param max2 The maximum value of the target range. Defaults to 1.
		 * @returns The interpolated value within the target range.
		 * @throws {Error} If the minimum and maximum of either range are equal.
		 */
		interpolate(min1: number, max1: number, min2?: number, max2?: number): number;
		/**
		 * Modulates the current number within a specified range.
		 * @param length The range length.
		 * @param start The start of the range. Defaults to 0.
		 * @returns The number constrained within the range.
		 * @throws {Error} If the range is zero.
		 */
		modulate(length: number, start?: number): number;
		/**
		 * Returns the current number unless it is NaN, replacing it with the provided value.
		 * @param value The fallback value.
		 * @returns The original number or the fallback.
		 */
		insteadNaN<T>(value: T): number | T;
		/**
		 * Returns the current number unless it is NaN or infinite, replacing it with the provided value.
		 * @param value The fallback value.
		 * @returns The original number or the fallback.
		 */
		insteadInfinity<T>(value: T): number | T;
		/**
		 * Returns the current number unless it is zero, NaN, or infinite, replacing it with the provided value.
		 * @param value The fallback value.
		 * @returns The original number or the fallback.
		 */
		insteadZero<T>(value: T): number | T;
	}
}

Number.import = function (source: any, name: string = `source`): number {
	if (typeof (source) !== `number`) throw new TypeError(`Unable to import ${name} due its ${/* typename */(source)} type`);
	return source.valueOf();
};

Number.prototype.export = function (): number {
	return this.valueOf();
};

Number.prototype.clamp = function (min: number, max: number): number {
	let value = this.valueOf();
	if (value < min) return min;
	if (value > max) return max;
	return value;
};

Number.prototype.interpolate = function (min1: number, max1: number, min2: number = 0, max2: number = 1): number {
	if (min1 === max1) throw new Error(`Minimum and maximum of the original range cant be equal`);
	if (min2 === max2) throw new Error(`Minimum and maximum of the target range cant be equal`);
	return min2 + (max2 - min2) * ((this.valueOf() - min1) / (max1 - min1));
};

Number.prototype.modulate = function (length: number, start: number = 0): number {
	if (length === 0) throw new Error(`Range can't be zero`);
	let value = (this.valueOf() - start) % length;
	if (value < 0) value += length;
	return value + start;
};

Number.prototype.insteadNaN = function <T>(value: T): number | T {
	const current = this.valueOf();
	if (Number.isNaN(current)) return value;
	return current;
};

Number.prototype.insteadInfinity = function <T>(value: T): number | T {
	const current = this.valueOf();
	if (!Number.isFinite(current)) return value;
	return current;
};

Number.prototype.insteadZero = function <T>(value: T): number | T {
	const current = this.valueOf();
	if (!Number.isFinite(current)) return value;
	if (current === 0) return value;
	return current;
};
//#endregion
//#region Boolean
declare global {
	interface BooleanConstructor {
		/**
		 * Imports a boolean value from a source.
		 * @param source The source value to import.
		 * @param name The name of the source value.
		 * @returns The imported boolean value.
		 * @throws {ReferenceError} If the source is undefined.
		 * @throws {TypeError} If the source is not a boolean.
		 */
		import(source: any, name?: string): boolean;
	}

	interface Boolean {
		/**
		 * Exports the boolean value.
		 * @returns The exported boolean value.
		 */
		export(): boolean;
	}
}

Boolean.import = function (source: any, name: string = `source`): boolean {
	if (typeof (source) !== `boolean`) throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
	return source.valueOf();
};

Boolean.prototype.export = function (): boolean {
	return this.valueOf();
};
//#endregion
//#region String
declare global {
	interface StringConstructor {
		/**
		 * Imports a string from a source.
		 * @param source The source value to import.
		 * @param name The name of the source value.
		 * @returns The imported string value.
		 * @throws {ReferenceError} If the source is undefined.
		 * @throws {TypeError} If the source is not a string.
		 */
		import(source: any, name?: string): string;
		/**
		 * A constant empty string.
		 */
		readonly empty: string;
		/**
		 * Checks if a string is empty.
		 * @param text The string to check.
		 * @returns True if the string is empty, otherwise false.
		 */
		isEmpty(text: string): boolean;
		/**
		 * Checks if a string contains only whitespace characters.
		 * @param text The string to check.
		 * @returns True if the string is empty or contains only whitespace, otherwise false.
		 */
		isWhitespace(text: string): boolean;
	}

	interface String {
		/**
		 * Exports the string value.
		 * @returns The exported string value.
		 */
		export(): string;
		/**
		 * Returns the current string unless it is empty, replacing it with the provided value.
		 * @param value The fallback value.
		 * @returns The original string or the fallback.
		 */
		insteadEmpty<T>(value: T): string | T;
		/**
		 * Returns the current string unless it consists only of whitespace, replacing it with the provided value.
		 * @param value The fallback value.
		 * @returns The original string or the fallback.
		 */
		insteadWhitespace<T>(value: T): string | T;
		/**
		 * Converts the string to title case, where the first letter of each word is capitalized.
		 * @returns The string converted to title case.
		 */
		toTitleCase(): string;
		/**
		 * Converts the string to title case based on the specified locale(s), capitalizing the first letter of each word.
		 * @param locales A single locale or an array of locales for locale-aware case conversion.
		 * @returns The string converted to title case with locale-awareness.
		 */
		toLocalTitleCase(locales?: string | string[]): string;
		/**
		 * Converts the string to title case based on the specified locale(s), capitalizing the first letter of each word.
		 * @param locales An argument supported by `Intl` for locale-aware case conversion.
		 * @returns The string converted to title case with locale-awareness.
		 */
		toLocalTitleCase(locales?: Intl.LocalesArgument): string;
		/**
		 * Reverses the string.
		 * @returns The reversed string.
		 */
		reverse(): string;
	}
}

String.import = function (source: any, name: string = `source`): string {
	if (typeof (source) !== `string`) throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
	return source.valueOf();
};

Object.defineProperty(String, `empty`, {
	value: ``,
	writable: false,
});

String.isEmpty = function (text: string): boolean {
	return (text.length === 0);
};

String.isWhitespace = function (text: string): boolean {
	return String.isEmpty(text.trimStart());
};

String.prototype.export = function (): string {
	return this.valueOf();
};

String.prototype.insteadEmpty = function <T>(value: T): string | T {
	const current = this.valueOf();
	if (String.isEmpty(current)) return value;
	return current;
};

String.prototype.insteadWhitespace = function <T>(value: T): string | T {
	const current = this.valueOf();
	if (String.isWhitespace(current)) return value;
	return current;
};

const patternWordsFirstLetter = /\b\w/g;

String.prototype.toTitleCase = function (): string {
	return this.toLowerCase().replace(patternWordsFirstLetter, char => char.toUpperCase());
};

String.prototype.toLocalTitleCase = function (locales: Intl.LocalesArgument | string | string[]): string {
	return this.toLocaleLowerCase(locales).replace(patternWordsFirstLetter, char => char.toLocaleUpperCase(locales));
};

String.prototype.reverse = function (): string {
	let string = String.empty;
	for (let index = this.length - 1; index >= 0; index--) {
		string += this[index];
	}
	return string;
};
//#endregion

/**
 * Interface representing an instance that can be archived.
 * @template N The type of the archived data.
 */
interface ArchivableInstance<N> {
	/**
	 * Exports the instance.
	 * @returns The exported data.
	 */
	export(): N;
}

/**
 * Interface representing a prototype that can create archivable instances.
 * @template N The type of the archived data.
 * @template I The type of the archivable instance.
 * @template A The types of the constructor arguments for the instance.
 */
interface ArchivablePrototype<N, I extends ArchivableInstance<N>, A extends readonly any[]> {
	/**
	 * Imports data and creates an instance.
	 * @param source The source data to import.
	 * @param name An optional name for the source.
	 * @returns The created instance.
	 */
	import(source: any, name?: string): I;
	/**
	 * @param args The constructor arguments.
	 */
	new(...args: A): I;
}

//#region Object
declare global {
	interface ObjectConstructor {
		/**
		 * Imports an object from a source.
		 * @param source The source to import from.
		 * @param name The name of the source.
		 * @returns The imported object.
		 * @throws {ReferenceError} Throws a ReferenceError if the source is undefined.
		 * @throws {TypeError} Throws a TypeError if the source is not an object or null.
		 */
		import(source: any, name?: string): object;
		/**
		 * Applies a callback function to a non-nullable value, or returns the original nullable value.
		 * @template T The type of the input value.
		 * @template N The type representing nullable.
		 * @template R The return type of the callback function.
		 * @param value The value to map.
		 * @param callback The function to apply if the value is non-nullable.
		 * @returns The mapped result.
		 */
		map<T, N extends Exclude<T, NonNullable<T>>, R>(value: NonNullable<T> | N, callback: (object: NonNullable<T>) => R): R | N;
		/**
		 * Ensures that a value is neither null nor undefined, throwing an error if it is.
		 * @template T
		 * @param value The value to check.
		 * @param name The name of the value, used in error messages.
		 * @returns The value if it is not null or undefined.
		 * @throws {Error} If the value is null or undefined.
		 */
		suppress<T>(value: T, name?: string): NonNullable<T>;
	}

	interface Object {
		/**
		 * Exports the object.
		 * @returns The exported object.
		 */
		export(): object;
	}
}

Object.import = function (source: any, name: string = `source`): object {
	if (typeof (source) !== `object` || source === null) throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
	return source.valueOf();
};

Object.map = function <T, N, R>(value: NonNullable<T> | N, callback: (object: NonNullable<T>) => R): R | N {
	if (value === null || value === undefined) return value;
	else return callback(value as NonNullable<T>);
};

Object.suppress = function <T>(value: T, name: string = `value`): NonNullable<T> {
	switch (value) {
		case null: throw new Error(`${name.toTitleCase()} mustn't be null`);
		case undefined: throw new Error(`${name.toTitleCase()} mustn't be undefined`);
		default: return (value as NonNullable<T>);
	}
};

Object.prototype.export = function (): object {
	return this.valueOf();
};
//#endregion
//#region Iterator
declare global {
	interface IteratorConstructor {
		/**
		 * Generates a range of integers between the specified minimum and maximum values (exclusive).
		 * @param min The minimum value of the range (inclusive).
		 * @param max The maximum value of the range (exclusive).
		 * @returns A generator yielding integers in the specified range.
		 */
		range(min: number, max: number): Generator<number>;
	}
}

Iterator.range = function* (min: number, max: number): Generator<number> {
	min = trunc(min);
	max = trunc(max);
	for (let index = 0; index < max - min; index++) {
		yield index + min;
	}
};
//#endregion
//#region Array
declare global {
	interface ArrayConstructor {
		/**
		 * Imports an array from a source.
		 * @param source The source to import from.
		 * @param name The name of the source.
		 * @returns The imported array.
		 * @throws {ReferenceError} Throws a ReferenceError if the source is undefined.
		 * @throws {TypeError} Throws a TypeError if the source is not an array.
		 */
		import(source: any, name?: string): any[];
		/**
		 * Creates an array of integers between the specified minimum and maximum values (exclusive).
		 * @param min The minimum value of the range (inclusive).
		 * @param max The maximum value of the range (exclusive).
		 * @returns An array containing integers in the specified range.
		 */
		range(min: number, max: number): number[];
	}

	interface Array<T> {
		/**
		 * Exports the array.
		 * @returns The exported array.
		 */
		export(): T[];
		/**
		 * Swaps the elements at the given indices in the array.
		 * @param index1 The index of the first element.
		 * @param index2 The index of the second element.
		 */
		swap(index1: number, index2: number): void;
		/**
		 * Resizes an array to the specified length. 
		 * If the new length is greater than the current length, fills the extra slots with the default value.
		 * If the new length is smaller, truncates the array.
		 * @template T
		 * @param length The new length for the array.
		 * @param _default The default value to fill new slots if the array is extended.
		 * @returns The resized array.
		 */
		resize(length: number, _default: T): T[];
	}
}

Array.import = function (source: any, name: string = `source`): any[] {
	if (!(source instanceof Array)) throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
	return Array.from(source);
};

Array.range = function (min: number, max: number): number[] {
	return Array.from(Iterator.range(min, max));
};

Array.prototype.export = function <T>(this: T[]): T[] {
	return Array.from(this);
};

Array.prototype.swap = function (index1: number, index2: number): void {
	index1 = trunc(index1);
	index2 = trunc(index2);
	const temporary = this[index1];
	this[index1] = this[index2];
	this[index2] = temporary;
};

Array.prototype.resize = function <T>(this: T[], length: number, _default: T): T[] {
	while (length > this.length) this.push(_default);
	this.length = length;
	return this;
};
//#endregion
//#region Data pair
/**
 * Represents a key-value pair of data.
 * @template K The type of the key.
 * @template V The type of the value.
 */
class DataPair<K, V> {
	/**
	 * Creates a DataPair instance from an array containing a key-value pair.
	 * @param source The source array containing the key-value pair.
	 * @returns A new DataPair instance.
	 */
	static fromArray<K, V>(source: Readonly<[NonNullable<K>, V]>): DataPair<K, V> {
		const [key, value] = source;
		return new DataPair(key, value);
	}
	/**
	 * Converts the DataPair instance to an array containing the key-value pair.
	 * @returns The key-value pair as an array.
	 */
	toArray(): [NonNullable<K>, V] {
		return [this.#key, this.#value];
	}
	/**
	 * @param key The key of the data pair.
	 * @param value The value of the data pair.
	 */
	constructor(key: NonNullable<K>, value: V) {
		this.#key = key;
		this.#value = value;
	}
	#key: NonNullable<K>;
	/**
	 * Gets the key of the data pair.
	 * @readonly
	 */
	get key(): NonNullable<K> {
		return this.#key;
	}
	#value: V;
	/**
	 * Gets the value of the data pair.
	 */
	get value(): V {
		return this.#value;
	}
	/**
	 * Sets the value of the data pair.
	 */
	set value(value: V) {
		this.#value = value;
	}
}
//#endregion
//#region Math
declare global {
	interface Math {
		/**
		 * Splits a number into its integer and fractional parts.
		 * @param x The number to be split.
		 * @returns A tuple where the first element is the integer part and the second element is the fractional part.
		 * ```ts
		 * const [integer, fractional] = Math.split(x);
		 * ```
		 */
		split(x: number): [number, number];
		/**
		 * Calculates the square of a number.
		 * @param x The number to square.
		 */
		sqpw(x: number): number;
		/**
		 * Converts radians to degrees.
		 * @param radians The angle in radians.
		 */
		toDegrees(radians: number): number;
		/**
		 * Converts degrees to radians.
		 * @param degrees The angle in degrees.
		 */
		toRadians(degrees: number): number;
		/**
		 * Calculates the arithmetic mean of the given numbers.
		 * @param values The numbers to calculate the mean from.
		 */
		meanArithmetic(...values: number[]): number;
		/**
		 * Calculates the geometric mean of the given numbers.
		 * @param values The numbers to calculate the mean from.
		 */
		meanGeometric(...values: number[]): number;
		/**
		 * Calculates the harmonic mean of the given numbers.
		 * @param values The numbers to calculate the mean from.
		 */
		meanHarmonic(...values: number[]): number;
	}
}

Math.split = function (x: number): [number, number] {
	const integer = trunc(x);
	return [integer, (x - integer)];
};

Math.sqpw = function (x: number): number {
	return x * x;
};

const toDegreeFactor = 180 / PI;
Math.toDegrees = function (radians: number): number {
	return radians * toDegreeFactor;
};

const toRadianFactor = PI / 180;
Math.toRadians = function (degrees: number): number {
	return degrees * toRadianFactor;
};

Math.meanArithmetic = function (...values: number[]): number {
	let summary = 0;
	for (let index = 0; index < values.length; index++) {
		summary += values[index];
	}
	return summary / values.length;
};

Math.meanGeometric = function (...values: number[]): number {
	let product = 1;
	for (let index = 0; index < values.length; index++) {
		product *= values[index];
	}
	return pow(product, 1 / values.length);
};

Math.meanHarmonic = function (...values: number[]): number {
	let summary = 0;
	for (let index = 0; index < values.length; index++) {
		const value = values[index];
		if (value === 0) return NaN;
		summary += 1 / value;
	}
	return values.length / summary;
};
//#endregion
//#region Promise
declare global {
	interface Promise<T> {
		/**
		 * Checks if the promise is fulfilled.
		 */
		readonly isFulfilled: Promise<boolean>;
		/**
		 * Retrieves the value of a resolved promise.
		 * @throws {Error} Throws an error if the promise is rejected.
		 */
		readonly value: Promise<T>;
		/**
		 * Retrieves the reason of a rejected promise.
		 * @throws {Error} Throws an error if the promise is fulfilled.
		 */
		readonly reason: Promise<any>;
	}
}

Object.defineProperty(Promise.prototype, `isFulfilled`, {
	async get<T>(this: Promise<T>): Promise<boolean> {
		const symbol = Symbol();
		try {
			return (await Promise.race([this, Promise.resolve(symbol)]) !== symbol);
		} catch (reason) {
			return true;
		}
	}
});

Object.defineProperty(Promise.prototype, `value`, {
	async get<T>(this: Promise<T>): Promise<T> {
		try {
			return await this;
		} catch (reason) {
			throw new Error(`Unable to get value of rejected promise`);
		}
	}
});

Object.defineProperty(Promise.prototype, `reason`, {
	async get<T>(this: Promise<T>): Promise<any> {
		try {
			await this;
			throw new Error(`Unable to get reason of resolved promise`);
		} catch (reason) {
			return reason;
		}
	}
});
//#endregion
//#region Promise factory
/**
 * A factory that allows running promises with a custom executor.
 */
class PromiseFactory<T> {
	/**
	 * @param executor The executor function that takes two arguments: resolve and reject.
	 */
	constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
		this.#executor = executor;
	}
	#executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void;
	/**
	 * Runs the promise using the provided executor.
	 * @returns The promise that resolves with the value produced by the executor.
	 */
	async run(): Promise<T> {
		const { promise, resolve, reject } = Promise.withResolvers<T>();
		this.#executor.call(promise, resolve, reject);
		return await promise;
	}
	/**
	 * Repeatedly runs the promise until the given predicate returns true.
	 * @param predicate A function that tests the resolved value.
	 * @returns The promise that resolves when the predicate is true.
	 */
	async runUntil(predicate: (value: T) => boolean): Promise<T> {
		while (true) {
			try {
				const result = await this.run();
				if (!predicate(result)) continue;
				return result;
			} catch {
				continue;
			}
		}
	}
	/**
	 * Runs the promise and maps its resolved value using the provided callback.
	 * @template U The type of the mapped result.
	 * @param callback A function that transforms the resolved value.
	 * @returns A promise that resolves with the transformed value.
	 */
	async runMapping<U>(callback: (value: T) => U): Promise<U> {
		while (true) {
			try {
				return callback(await this.run());
			} catch {
				continue;
			}
		}
	}
}
//#endregion
//#region Error
declare global {
	interface ErrorConstructor {
		/**
		 * Generates an error object from the provided input.
		 * @param reason The reason input.
		 */
		from(reason: any): Error;
		/**
		 * Throws an error based on the provided input.
		 * @param reason The reason for the error.
		 */
		throws(reason?: any): never;
	}

	interface Error {
		/**
		 * Returns a string representation of the Error object.
		 * @returns A string representation of the Error object.
		 */
		toString(): string;
	}
}

Error.from = function (reason: any): Error {
	return reason instanceof Error ? reason : new Error(reason ?? `Undefined reason`);
};

Error.throws = function (reason: any = undefined): never {
	throw Error.from(reason);
};

Error.prototype.toString = function (): string {
	let text = this.stack ?? `${this.name}: ${this.message}`;
	if (this.cause !== undefined) text += ` cause of:\n\r${Error.from(this.cause)}`;
	return text;
};
//#endregion
//#region Implementation error
class ImplementationError extends ReferenceError {
	/**
	 * @param options 
	 */
	constructor(options: ErrorOptions = {}) {
		super(`Not implemented function`, options);
		if (new.target !== ImplementationError) throw new TypeError(`Unable to create an instance of sealed-extended class`);
		this.name = `ImplementationError`;
	}
}
//#endregion
//#region Global
declare global {
	/**
	 * Returns the prototype of the given non-nullable value.
	 * @template T
	 * @param value The value whose prototype is to be retrieved. It cannot be null or undefined.
	 */
	function prototype<T>(value: NonNullable<T>): Function;
	/**
	 * Gets the type name of a value.
	 * @param value The value to get the type name of.
	 * @returns The type name of the value.
	 */
	function typename(value: any): string;
}

globalThis.prototype = function <T>(value: NonNullable<T>): Function {
	return value.constructor;
};

globalThis.typename = function (value: any): string {
	switch (value) {
		case undefined:
		case null: return String(value).toTitleCase();
		default: return prototype(value).name;
	}
};
//#endregion

export { DataPair, PromiseFactory, ImplementationError };	
export type { PrimitivesHintMap, ArchivableInstance, ArchivablePrototype };

