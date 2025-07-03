"use strict";

import { ImplementationError, PrimitivesHintMap } from "./extensions.js";

const { hypot, abs, trunc } = Math;

//#region Vector
/**
 * Abstract base class representing a vector.
 * @abstract
 */
abstract class Vector {
	//#region Operations
	/**
	 * Checks if every component of the vector is NaN.
	 * @param vector The vector to check.
	 * @returns True if every component of the vector is NaN, otherwise false.
	 */
	static isNaN(vector: Vector): boolean {
		for (const metric of vector) {
			if (!Number.isNaN(metric)) return false;
		}
		return true;
	}
	/**
	 * Checks if all components of the vector are finite numbers.
	 * @param vector The vector to check.
	 * @returns True if all components of the vector are finite, otherwise false.
	 */
	static isFinite(vector: Vector): boolean {
		for (const metric of vector) {
			if (!Number.isFinite(metric)) return false;
		}
		return true;
	}
	/**
	 * Checks if all components of the vector are integers.
	 * @param vector The vector to check.
	 * @returns True if all components of the vector are integers, otherwise false.
	 */
	static isInteger(vector: Vector): boolean {
		for (const metric of vector) {
			if (!Number.isInteger(metric)) return false;
		}
		return true;
	}
	/**
	 * Checks if all components of the vector are safe integers.
	 * @param vector The vector to check.
	 * @returns True if all components of the vector are safe integers, otherwise false.
	 */
	static isSafeInteger(vector: Vector): boolean {
		for (const metric of vector) {
			if (!Number.isSafeInteger(metric)) return false;
		}
		return true;
	}
	static #join(metrics: any[]): string {
		return `(${metrics.join(`, `)})`;
	}
	constructor() {
		if (new.target === Vector) throw new TypeError(`Unable to create an instance of an abstract class`);
	}
	//#endregion
	//#region Modifiers
	/**
	 * Returns an iterator object that yields each component of the vector.
	 * @abstract
	 */
	*[Symbol.iterator](): Iterator<number, void> {
		throw new ImplementationError();
	}
	/**
	 * Returns a string representation of the vector with a fixed number of digits after the decimal vector.
	 * @param digits The number of digits to appear after the decimal vector.
	 * @returns A string representation of the vector.
	 */
	toFixed(digits?: number): string {
		return Vector.#join(Array.from(this, metric => metric.toFixed(digits)));
	}
	/**
	 * Returns a string representation of the vector in exponential notation.
	 * @param digits The number of digits to appear after the decimal vector.
	 * @returns A string representation of the vector in exponential notation.
	 */
	toExponential(digits?: number): string {
		return Vector.#join(Array.from(this, metric => metric.toExponential(digits)));
	}
	/**
	 * Returns a string representation of the vector with a specified precision.
	 * @param precision The number of significant digits.
	 * @returns A string representation of the vector with the specified precision.
	 */
	toPrecision(precision?: number): string {
		return Vector.#join(Array.from(this, metric => metric.toPrecision(precision)));
	}
	/**
	 * Returns a string representation of the vector in the specified radix (base).
	 * @param radix An integer between 2 and 36 specifying the base to use for representing numeric values.
	 * @returns A string representation of the vector in the specified radix.
	 */
	toString(radix?: number): string {
		return Vector.#join(Array.from(this, metric => metric.toString(radix)));
	}
	/**
	 * Converts the vector components to a localized string representation.
	 * @param locales A string or array of strings representing the locale.
	 * @param options Formatting options for the number representation.
	 * @returns A localized string representation of the vector.
	 */
	toLocaleString(locales?: string | string[], options?: Intl.NumberFormatOptions): string;
	/**
	 * Converts the vector components to a localized string representation.
	 * @param locales An Intl.LocalesArgument representing the locale.
	 * @param options Formatting options for the number representation.
	 * @returns A localized string representation of the vector.
	 */
	toLocaleString(locales?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions): string;
	toLocaleString(arg1?: Intl.LocalesArgument | string[] | string, arg2?: Intl.NumberFormatOptions): string {
		return Vector.#join(Array.from(this, metric => metric.toLocaleString(arg1, arg2)));
	}
	//#endregion
}
//#endregion

//#region Vector 1D
/**
 * Represents a vector in one-dimensional space.
 */
class Vector1D extends Vector {
	//#region Operations
	/**
	 * Calculates the distance between two vectors.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The distance between the two vectors.
	 */
	static getDistanceBetween(first: Readonly<Vector1D>, second: Readonly<Vector1D>): number {
		return hypot(first.x - second.x);
	}
	/**
	 * Adds two vectors.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the addition.
	 */
	static ["+"](first: Readonly<Vector1D>, second: Readonly<Vector1D>): Vector1D {
		return Vector1D.fromVector(first)["+="](second);
	}
	/**
	 * Subtracts the second vector from the first.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the subtraction.
	 */
	static ["-"](first: Readonly<Vector1D>, second: Readonly<Vector1D>): Vector1D {
		return Vector1D.fromVector(first)["-="](second);
	}
	/**
	 * Multiplies two vectors.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the multiplication.
	 */
	static ["*"](first: Readonly<Vector1D>, second: Readonly<Vector1D>): Vector1D {
		return Vector1D.fromVector(first)["*="](second);
	}
	/**
	 * Divides the first vector by the second.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the division.
	 */
	static ["/"](first: Readonly<Vector1D>, second: Readonly<Vector1D>): Vector1D {
		return Vector1D.fromVector(first)["/="](second);
	}
	//#endregion
	//#region Presets
	/**
	 * Returns the new NaN vector - (NaN).
	 * @readonly
	 */
	static get newNaN(): Vector1D {
		return Vector1D.fromScalar(NaN);
	}
	/**
	 * Returns the new zero vector - (0).
	 * @readonly
	 */
	static get newZero(): Vector1D {
		return Vector1D.fromScalar(0);
	}
	/**
	 * Returns the new unit vector along the x-axis - (1).
	 * @readonly
	 */
	static get newUnitX(): Vector1D {
		return new Vector1D(1);
	}
	/**
	 * Returns the new one vector - (1).
	 * @readonly
	 */
	static get newOne(): Vector1D {
		return Vector1D.fromScalar(1);
	}
	//#endregion
	//#region Builders
	static #regexVectorParser: RegExp = /^\(\s*(\S+)\s*\)$/;
	/**
	 * Parses a string representation of a vector.
	 * @param string The string representation of the vector.
	 * @returns The parsed vector.
	 * @throws {SyntaxError} If the string is not a valid representation of a vector.
	 */
	static parse(string: string): Vector1D {
		const match = Vector1D.#regexVectorParser.exec(string.trim());
		if (match === null) throw new SyntaxError(`Invalid syntax '${string}' for 1D vector`);
		const [, x] = match.map(Number);
		return new Vector1D(x);
	}
	/**
	 * Creates a vector where all components have the same value.
	 * @param value The scalar value for all coordinates.
	 * @returns A new vector with all components set to the given value.
	 */
	static fromScalar(value: number): Vector1D {
		return new Vector1D(value);
	}
	/**
	 * Creates a vector from another vector-like object.
	 * @param vector The source vector.
	 * @returns A new vector with the components of the input vector.
	 */
	static fromVector(vector: Vector): Vector1D {
		const metrics = vector[Symbol.iterator]();
		const metric1 = metrics.next();
		return new Vector1D(
			metric1.done ? 0 : metric1.value
		);
	}
	/**
	 * @param x The x-coordinate of the vector.
	 */
	constructor(x: number) {
		super();
		this.#x = x;
	}
	//#endregion
	//#region Properties
	#x: number;
	/**
	 * Gets the x-coordinate of the vector.
	 */
	get x(): number {
		return this.#x;
	}
	/**
	 * Sets the x-coordinate of the vector.
	 */
	set x(value: number) {
		this.#x = value;
	}
	//#endregion
	//#region Modifiers
	*[Symbol.iterator](): Iterator<number, void> {
		yield this.x;
		return;
	}
	/**
	 * Adds another vector to the current vector.
	 * @param other Another vector to add.
	 * @returns The updated vector.
	 */
	["+="](other: Readonly<Vector1D>): Vector1D {
		this.x += other.x;
		return this;
	}
	/**
	 * Subtracts another vector from the current vector.
	 * @param other Another vector to subtract.
	 * @returns The updated vector.
	 */
	["-="](other: Readonly<Vector1D>): Vector1D {
		this.x -= other.x;
		return this;
	}
	/**
	 * Multiplies the current vector by another vector.
	 * @param other Another vector to multiply by.
	 * @returns The updated vector.
	 */
	["*="](other: Readonly<Vector1D>): Vector1D {
		this.x *= other.x;
		return this;
	}
	/**
	 * Divides the current vector by another vector.
	 * @param other Another vector to divide by.
	 * @returns The updated vector.
	 */
	["/="](other: Readonly<Vector1D>): Vector1D {
		this.x /= other.x;
		return this;
	}
	//#endregion
}
//#endregion
//#region Vector 2D
/**
 * Represents a vector in two-dimensional space.
 */
class Vector2D extends Vector1D {
	//#region Operations
	/**
	 * Calculates the distance between two vectors.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The distance between the two vectors.
	 */
	static getDistanceBetween(first: Readonly<Vector2D>, second: Readonly<Vector2D>): number {
		return hypot(first.x - second.x, first.y - second.y);
	}
	/**
	 * Adds two vectors.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the addition.
	 */
	static ["+"](first: Readonly<Vector2D>, second: Readonly<Vector2D>): Vector2D {
		return Vector2D.fromVector(first)["+="](second);
	}
	/**
	 * Subtracts the second vector from the first.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the subtraction.
	 */
	static ["-"](first: Readonly<Vector2D>, second: Readonly<Vector2D>): Vector2D {
		return Vector2D.fromVector(first)["-="](second);
	}
	/**
	 * Multiplies two vectors.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the multiplication.
	 */
	static ["*"](first: Readonly<Vector2D>, second: Readonly<Vector2D>): Vector2D {
		return Vector2D.fromVector(first)["*="](second);
	}
	/**
	 * Divides the first vector by the second.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the division.
	 */
	static ["/"](first: Readonly<Vector2D>, second: Readonly<Vector2D>): Vector2D {
		return Vector2D.fromVector(first)["/="](second);
	}
	//#endregion
	//#region Presets
	/**
	 * Returns the new NaN vector - (NaN, NaN).
	 * @readonly
	 */
	static get newNaN(): Vector2D {
		return Vector2D.fromScalar(NaN);
	}
	/**
	 * Returns the new zero vector - (0, 0).
	 * @readonly
	 */
	static get newZero(): Vector2D {
		return Vector2D.fromScalar(0);
	}
	/**
	 * Returns the new unit vector along the x-axis - (1, 0).
	 * @readonly
	 */
	static get newUnitX(): Vector2D {
		return new Vector2D(1, 0);
	}
	/**
	 * Returns the new unit vector along the y-axis - (0, 1).
	 * @readonly
	 */
	static get newUnitY(): Vector2D {
		return new Vector2D(0, 1);
	}
	/**
	 * Returns the new one vector - (1, 1).
	 * @readonly
	 */
	static get newOne(): Vector2D {
		return Vector2D.fromScalar(1);
	}
	//#endregion
	//#region Builders
	static #regexVectorParser: RegExp = /^\(\s*(\S+)\s*,\s*(\S+)\s*\)$/;
	/**
	 * Parses a string representation of a vector.
	 * @param string The string representation of the vector.
	 * @returns The parsed vector.
	 * @throws {SyntaxError} If the string is not a valid representation of a vector.
	 */
	static parse(string: string): Vector2D {
		const match = Vector2D.#regexVectorParser.exec(string.trim());
		if (match === null) throw new SyntaxError(`Invalid syntax '${string}' for 2D vector`);
		const [, x, y] = match.map(Number);
		return new Vector2D(x, y);
	}
	/**
	 * Creates a vector where all components have the same value.
	 * @param value The scalar value for all coordinates.
	 * @returns A new vector with all components set to the given value.
	 */
	static fromScalar(value: number): Vector2D {
		return new Vector2D(value, value);
	}
	/**
	 * Creates a vector from another vector-like object.
	 * @param vector The source vector.
	 * @returns A new vector with the components of the input vector.
	 */
	static fromVector(vector: Vector): Vector2D {
		const metrics = vector[Symbol.iterator]();
		const metric1 = metrics.next();
		const metric2 = metrics.next();
		return new Vector2D(
			metric1.done ? 0 : metric1.value,
			metric2.done ? 0 : metric2.value
		);
	}
	/**
	 * @param x The x-coordinate of the vector.
	 * @param y The y-coordinate of the vector.
	 */
	constructor(x: number, y: number) {
		super(x);
		this.#y = y;
	}
	//#endregion
	//#region Properties
	#y: number;
	/**
	 * Gets the y-coordinate of the vector.
	 */
	get y(): number {
		return this.#y;
	}
	/**
	 * Sets the y-coordinate of the vector.
	 */
	set y(value: number) {
		this.#y = value;
	}
	//#endregion
	//#region Modifiers
	*[Symbol.iterator](): Iterator<number, void> {
		yield this.x;
		yield this.y;
		return;
	}
	/**
	 * Adds another vector to the current vector.
	 * @param other Another vector to add.
	 * @returns The updated vector.
	 */
	["+="](other: Readonly<Vector2D>): Vector2D {
		this.x += other.x;
		this.y += other.y;
		return this;
	}
	/**
	 * Subtracts another vector from the current vector.
	 * @param other Another vector to subtract.
	 * @returns The updated vector.
	 */
	["-="](other: Readonly<Vector2D>): Vector2D {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}
	/**
	 * Multiplies the current vector by another vector.
	 * @param other Another vector to multiply by.
	 * @returns The updated vector.
	 */
	["*="](other: Readonly<Vector2D>): Vector2D {
		this.x *= other.x;
		this.y *= other.y;
		return this;
	}
	/**
	 * Divides the current vector by another vector.
	 * @param other Another vector to divide by.
	 * @returns The updated vector.
	 */
	["/="](other: Readonly<Vector2D>): Vector2D {
		this.x /= other.x;
		this.y /= other.y;
		return this;
	}
	//#endregion
}
//#endregion
//#region Vector 3D
/**
 * Represents a vector in three-dimensional space.
 */
class Vector3D extends Vector2D {
	//#region Operations
	/**
	 * Calculates the distance between two vectors.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The distance between the two vectors.
	 */
	static getDistanceBetween(first: Readonly<Vector3D>, second: Readonly<Vector3D>): number {
		return hypot(first.x - second.x, first.y - second.y, first.z - second.z);
	}
	/**
	 * Adds two vectors.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the addition.
	 */
	static ["+"](first: Readonly<Vector3D>, second: Readonly<Vector3D>): Vector3D {
		return Vector3D.fromVector(first)["+="](second);
	}
	/**
	 * Subtracts the second vector from the first.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the subtraction.
	 */
	static ["-"](first: Readonly<Vector3D>, second: Readonly<Vector3D>): Vector3D {
		return Vector3D.fromVector(first)["-="](second);
	}
	/**
	 * Multiplies two vectors.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the multiplication.
	 */
	static ["*"](first: Readonly<Vector3D>, second: Readonly<Vector3D>): Vector3D {
		return Vector3D.fromVector(first)["*="](second);
	}
	/**
	 * Divides the first vector by the second.
	 * @param first The first vector.
	 * @param second The second vector.
	 * @returns The result of the division.
	 */
	static ["/"](first: Readonly<Vector3D>, second: Readonly<Vector3D>): Vector3D {
		return Vector3D.fromVector(first)["/="](second);
	}
	//#endregion
	//#region Presets
	/**
	 * Returns the new NaN vector - (NaN, NaN, NaN).
	 * @readonly
	 */
	static get newNaN(): Vector3D {
		return Vector3D.fromScalar(NaN);
	}
	/**
	 * Returns the new zero vector - (0, 0, 0).
	 * @readonly
	 */
	static get newZero(): Vector3D {
		return Vector3D.fromScalar(0);
	}
	/**
	 * Returns the new unit vector along the x-axis - (1, 0, 0).
	 * @readonly
	 */
	static get newUnitX(): Vector3D {
		return new Vector3D(1, 0, 0);
	}
	/**
	 * Returns the new unit vector along the y-axis - (0, 1, 0).
	 * @readonly
	 */
	static get newUnitY(): Vector3D {
		return new Vector3D(0, 1, 0);
	}
	/**
	 * Returns the new unit vector along the z-axis - (0, 0, 1).
	 * @readonly
	 */
	static get newUnitZ(): Vector3D {
		return new Vector3D(0, 0, 1);
	}
	/**
	 * Returns the new one vector - (1, 1, 1).
	 * @readonly
	 */
	static get newOne(): Vector3D {
		return Vector3D.fromScalar(1);
	}
	//#endregion
	//#region Builders
	static #regexVectorParser: RegExp = /^\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)$/;
	/**
	 * Parses a string representation of a vector.
	 * @param string The string representation of the vector.
	 * @returns The parsed vector.
	 * @throws {SyntaxError} If the string is not a valid representation of a vector.
	 */
	static parse(string: string): Vector3D {
		const match = Vector3D.#regexVectorParser.exec(string.trim());
		if (match === null) throw new SyntaxError(`Invalid syntax '${string}' for 3D vector`);
		const [, x, y, z] = match.map(Number);
		return new Vector3D(x, y, z);
	}
	/**
	 * Creates a vector where all components have the same value.
	 * @param value The scalar value for all coordinates.
	 * @returns A new vector with all components set to the given value.
	 */
	static fromScalar(value: number): Vector3D {
		return new Vector3D(value, value, value);
	}
	/**
	 * Creates a vector from another vector-like object.
	 * @param vector The source vector.
	 * @returns A new vector with the components of the input vector.
	 */
	static fromVector(vector: Vector): Vector3D {
		const metrics = vector[Symbol.iterator]();
		const metric1 = metrics.next();
		const metric2 = metrics.next();
		const metric3 = metrics.next();
		return new Vector3D(
			metric1.done ? 0 : metric1.value,
			metric2.done ? 0 : metric2.value,
			metric3.done ? 0 : metric3.value
		);
	}
	/**
	 * @param x The x-coordinate of the vector.
	 * @param y The y-coordinate of the vector.
	 * @param z The z-coordinate of the vector.
	 */
	constructor(x: number, y: number, z: number) {
		super(x, y);
		this.#z = z;
	}
	//#endregion
	//#region Properties
	#z: number;
	/**
	 * Gets the z-coordinate of the vector.
	 */
	get z(): number {
		return this.#z;
	}
	/**
	 * Sets the z-coordinate of the vector.
	 */
	set z(value: number) {
		this.#z = value;
	}
	//#endregion
	//#region Modifiers
	*[Symbol.iterator](): Iterator<number, void> {
		yield this.x;
		yield this.y;
		yield this.z;
		return;
	}
	/**
	 * Adds another vector to the current vector.
	 * @param other Another vector to add.
	 * @returns The updated vector.
	 */
	["+="](other: Readonly<Vector3D>): Vector3D {
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this;
	}
	/**
	 * Subtracts another vector from the current vector.
	 * @param other Another vector to subtract.
	 * @returns The updated vector.
	 */
	["-="](other: Readonly<Vector3D>): Vector3D {
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	}
	/**
	 * Multiplies the current vector by another vector.
	 * @param other Another vector to multiply by.
	 * @returns The updated vector.
	 */
	["*="](other: Readonly<Vector3D>): Vector3D {
		this.x *= other.x;
		this.y *= other.y;
		this.z *= other.z;
		return this;
	}
	/**
	 * Divides the current vector by another vector.
	 * @param other Another vector to divide by.
	 * @returns The updated vector.
	 */
	["/="](other: Readonly<Vector3D>): Vector3D {
		this.x /= other.x;
		this.y /= other.y;
		this.z /= other.z;
		return this;
	}
	//#endregion
}
//#endregion

//#region Timespan
/**
 * Represents a duration of time.
 */
class Timespan {
	//#region Converters
	/**
	 * @param hours integer
	 * @param minutes integer
	 * @param seconds integer
	 * @param milliseconds integer
	 * @returns [0 - +∞), [0 - 59], [0 - 59], [0 - 999]
	 */
	static #fixTimeOffset(hours: number, minutes: number, seconds: number, milliseconds: number): [number, number, number, number] {
		seconds += trunc(milliseconds / 1000);
		milliseconds %= 1000;
		minutes += trunc(seconds / 60);
		seconds %= 60;
		hours += trunc(minutes / 60);
		minutes %= 60;
		return [hours, minutes, seconds, milliseconds];
	}
	/**
	 * @param duration integer
	 * @returns boolean, [0 - +∞), [0 - 59], [0 - 59], [0 - 999]
	 */
	static #toTime(duration: number): [boolean, number, number, number, number] {
		const negativity = duration < 0;
		duration = abs(duration);
		const milliseconds = duration % 1000;
		duration = trunc(duration / 1000);
		const seconds = duration % 60;
		duration = trunc(duration / 60);
		const minutes = duration % 60;
		duration = trunc(duration / 60);
		const hours = duration;
		return [negativity, hours, minutes, seconds, milliseconds];
	}
	/**
	 * @param negativity boolean
	 * @param hours [0 - +∞)
	 * @param minutes [0 - 59]
	 * @param seconds [0 - 59]
	 * @param milliseconds [0 - 999]
	 * @returns integer
	 */
	static #toDuration(negativity: boolean, hours: number, minutes: number, seconds: number, milliseconds: number): number {
		return (negativity ? -1 : 1) * ((((hours) * 60 + minutes) * 60 + seconds) * 1000 + milliseconds);
	}
	//#endregion
	//#region Operations
	/**
	 * Adds two timespans and returns the result as a new Timespan.
	 * @param first The first timespan to add.
	 * @param second The second timespan to add.
	 * @returns A new Timespan representing the sum of the two timespans.
	 */
	static ["+"](first: Readonly<Timespan>, second: Readonly<Timespan>): Timespan {
		return new Timespan(first)["+="](second);
	}
	/**
	 * Subtracts the second timespan from the first and returns the result as a new Timespan.
	 * @param first The timespan from which the second will be subtracted.
	 * @param second The timespan to subtract.
	 * @returns A new Timespan representing the difference between the two timespans.
	 */
	static ["-"](first: Readonly<Timespan>, second: Readonly<Timespan>): Timespan {
		return new Timespan(first)["-="](second);
	}
	/**
	 * Multiplies two timespans and returns the result as a new Timespan.
	 * @param first The first timespan to multiply.
	 * @param second The second timespan to multiply.
	 * @returns A new Timespan representing the product of the two timespans.
	 */
	static ["*"](first: Readonly<Timespan>, second: Readonly<Timespan>): Timespan {
		return new Timespan(first)["*="](second);
	}
	/**
	 * Divides the first timespan by the second and returns the result as a new Timespan.
	 * @param first The timespan to be divided.
	 * @param second The timespan to divide by.
	 * @returns A new Timespan representing the result of the division.
	 */
	static ["/"](first: Readonly<Timespan>, second: Readonly<Timespan>): Timespan {
		return new Timespan(first)["/="](second);
	}
	//#endregion
	//#region Presets
	/**
	 * Represents a new zero timespan.
	 * @readonly
	 */
	static get newZero(): Timespan { return Timespan.viaTime(false, 0, 0, 0, 0); };
	/**
	 * Represents a new timespan of one millisecond.
	 * @readonly
	 */
	static get newMillisecond(): Timespan { return Timespan.viaTime(false, 0, 0, 0, 1); };
	/**
	 * Represents a new timespan of one second.
	 * @readonly
	 */
	static get newSecond(): Timespan { return Timespan.viaTime(false, 0, 0, 1, 0); };
	/**
	 * Represents a new timespan of one minute.
	 * @readonly
	 */
	static get newMinute(): Timespan { return Timespan.viaTime(false, 0, 1, 0, 0); };
	/**
	 * Represents a new timespan of one hour.
	 * @readonly
	 */
	static get newHour(): Timespan { return Timespan.viaTime(false, 1, 0, 0, 0); };
	/**
	 * Represents a new timespan of one day.
	 * @readonly
	 */
	static get newDay(): Timespan { return Timespan.viaTime(false, 24, 0, 0, 0); };
	//#endregion
	//#region Builders
	static #patternTimespan: RegExp = /^(-)?(?:(?:(\d+):)?(\d+):)?(\d+)(?:\.(\d+))?$/;
	/**
	 * Parses a string representation into a Timespan object.
	 * @param string The string to parse.
	 * @returns The parsed Timespan object.
	 * @throws {SyntaxError} If the string has invalid syntax.
	 */
	static parse(string: string): Timespan {
		const match = Timespan.#patternTimespan.exec(string);
		if (match === null) throw new SyntaxError(`Invalid time '${string}' syntax`);
		const negativity = (match[1] !== undefined);
		const [, , hours, minutes, seconds, milliseconds] = match.map(part => Number(part ?? 0));
		return Timespan.viaTime(negativity, hours, minutes, seconds, milliseconds);
	}
	/**
	 * Creates a Timespan object from a duration.
	 * @param duration The duration in milliseconds.
	 * @returns The Timespan object.
	 * @throws {TypeError} If the duration is not a finite number.
	 */
	static viaDuration(duration: number = 0): Timespan {
		if (!Number.isFinite(duration)) throw new TypeError(`The duration ${duration} must be a finite number`);
		const timespan = new Timespan();
		timespan.#duration = trunc(duration);
		[timespan.#negativity, timespan.#hours, timespan.#minutes, timespan.#seconds, timespan.#milliseconds] = Timespan.#toTime(timespan.#duration);
		return timespan;
	}
	/**
	 * Creates a Timespan object from individual time components.
	 * @param negativity Whether the timespan is negative.
	 * @param hours The hours component.
	 * @param minutes The minutes component.
	 * @param seconds The seconds component.
	 * @param milliseconds The milliseconds component.
	 * @returns The Timespan object.
	 * @throws {TypeError} If any of the parameters is not a finite number.
	 */
	static viaTime(negativity: boolean = false, hours: number = 0, minutes: number = 0, seconds: number = 0, milliseconds: number = 0): Timespan {
		if (!Number.isFinite(hours)) throw new TypeError(`The hours ${hours} must be a finite number`);
		if (!Number.isFinite(minutes)) throw new TypeError(`The minutes ${minutes} must be a finite number`);
		if (!Number.isFinite(seconds)) throw new TypeError(`The seconds ${seconds} must be a finite number`);
		if (!Number.isFinite(milliseconds)) throw new TypeError(`The milliseconds ${milliseconds} must be a finite number`);
		const timespan = new Timespan();
		timespan.#negativity = negativity;
		[timespan.#hours, timespan.#minutes, timespan.#seconds, timespan.#milliseconds] = Timespan.#fixTimeOffset(trunc(hours), trunc(minutes), trunc(seconds), trunc(milliseconds));
		timespan.#duration = Timespan.#toDuration(timespan.#negativity, timespan.#hours, timespan.#minutes, timespan.#seconds, timespan.#milliseconds);
		return timespan;
	}
	/**
	 */
	constructor();
	/**
	 * @param source The source Timespan object.
	 */
	constructor(source: Readonly<Timespan>);
	constructor(arg1: Readonly<Timespan> | void) {
		if (arg1 instanceof Timespan) {
			this.#duration = arg1.#duration;
			this.#negativity = arg1.#negativity;
			this.#hours = arg1.#hours;
			this.#minutes = arg1.#minutes;
			this.#seconds = arg1.#seconds;
			this.#milliseconds = arg1.#milliseconds;
			return;
		}
		if (typeof (arg1) === `undefined`) {
			this.#duration = 0;
			this.#negativity = false;
			this.#hours = 0;
			this.#minutes = 0;
			this.#seconds = 0;
			this.#milliseconds = 0;
			return;
		}
		throw new TypeError(`No overload with (${[arg1].map(typename).join(`, `)}) arguments`);
	}
	//#endregion
	//#region Properties
	#duration: number;
	/**
	 * Gets the duration of the timespan in milliseconds.
	 */
	get duration(): number {
		return this.#duration;
	}
	/**
	 * Sets the duration of the timespan in milliseconds.
	 */
	set duration(value: number) {
		if (!Number.isFinite(value)) return;
		this.#duration = trunc(value);
		[this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#toTime(this.#duration);
	}
	#negativity: boolean;
	/**
	 * Gets whether the timespan is negative.
	 */
	get negativity(): boolean {
		return this.#negativity;
	}
	/**
	 * Sets whether the timespan is negative.
	 */
	set negativity(value: boolean) {
		this.#negativity = value;
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	#hours: number;
	/**
	 * Gets the hours component of the timespan.
	 */
	get hours(): number {
		return this.#hours;
	}
	/**
	 * Sets the hours component of the timespan.
	 */
	set hours(value: number) {
		if (!Number.isFinite(value)) return;
		[this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#fixTimeOffset(trunc(value), this.#minutes, this.#seconds, this.#milliseconds);
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	#minutes: number;
	/**
	 * Gets the minutes component of the timespan.
	 */
	get minutes(): number {
		return this.#minutes;
	}
	/**
	 * Sets the minutes component of the timespan.
	 */
	set minutes(value: number) {
		if (!Number.isFinite(value)) return;
		[this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#fixTimeOffset(this.#hours, trunc(value), this.#seconds, this.#milliseconds);
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	#seconds: number;
	/**
	 * Gets the seconds component of the timespan.
	 */
	get seconds(): number {
		return this.#seconds;
	}
	/**
	 * Sets the seconds component of the timespan.
	 */
	set seconds(value: number) {
		if (!Number.isFinite(value)) return;
		[this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#fixTimeOffset(this.#hours, this.#minutes, trunc(value), this.#milliseconds);
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	#milliseconds: number;
	/**
	 * Gets the milliseconds component of the timespan.
	 */
	get milliseconds(): number {
		return this.#milliseconds;
	}
	/**
	 * Sets the milliseconds component of the timespan.
	 */
	set milliseconds(value: number) {
		if (!Number.isFinite(value)) return;
		[this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#fixTimeOffset(this.#hours, this.#minutes, this.#seconds, trunc(value));
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	//#endregion
	//#region Modifiers
	/**
	 * Converts the timespan to a string representation.
	 * @param full Determines whether to include all time components or not. Default is true.
	 * @returns The string representation of the timespan.
	 */
	toString(full: boolean = true): string {
		const { negativity, hours, minutes, seconds, milliseconds } = this;
		let string = seconds.toFixed().padStart(2, `0`);
		if (full || milliseconds > 0) {
			string = `${string}.${milliseconds.toFixed().padStart(3, `0`)}`;
		}
		if (full || hours > 0) {
			string = `${minutes.toFixed().padStart(2, `0`)}:${string}`;
			string = `${hours.toFixed().padStart(2, `0`)}:${string}`;
		} else if (minutes > 0) {
			string = `${minutes.toFixed().padStart(2, `0`)}:${string}`;
		}
		if (negativity) {
			string = `-${string}`;
		}
		return string;
	}
	[Symbol.toPrimitive]<K extends keyof PrimitivesHintMap>(hint: K): PrimitivesHintMap[K];
	[Symbol.toPrimitive]<K extends keyof PrimitivesHintMap>(hint: K): PrimitivesHintMap[keyof PrimitivesHintMap] {
		switch (hint) {
			case `number`: return this.#duration;
			case `boolean`: return this.#negativity;
			case `string`: return this.toString();
			default: throw new TypeError(`Invalid '${hint}' primitive hint`);
		}
	}
	/**
	 * Adds another timespan to this timespan.
	 * @param other The timespan to add.
	 * @returns The updated timespan.
	 */
	["+="](other: Readonly<Timespan>): Timespan {
		this.duration += other.duration;
		return this;
	}
	/**
	 * Subtracts another timespan from this timespan.
	 * @param other The timespan to subtract.
	 * @returns The updated timespan.
	 */
	["-="](other: Readonly<Timespan>): Timespan {
		this.duration += other.duration;
		return this;
	}
	/**
	 * Multiplies this timespan by another timespan.
	 * @param other The timespan to multiply by.
	 * @returns The updated timespan.
	 */
	["*="](other: Readonly<Timespan>): Timespan {
		this.duration += other.duration;
		return this;
	}
	/**
	 * Divides this timespan by another timespan.
	 * @param other The timespan to divide by.
	 * @returns The updated timespan.
	 */
	["/="](other: Readonly<Timespan>): Timespan {
		this.duration += other.duration;
		return this;
	}
	//#endregion
}
//#endregion

//#region Matrix
/**
 * Represents a matrix with generic data type.
 */
class Matrix<T> {
	/**
	 * @param size The size of the matrix.
	 * @param initializer The value initializer for all elements in the matrix.
	 * @throws {TypeError} If the x or y coordinate of the size is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the size is negative.
	 */
	constructor(size: Readonly<Vector2D>, initializer: (position: Vector2D) => T) {
		if (!Vector.isInteger(size)) throw new TypeError(`The size ${size} must be a finite integer vector`);
		if (0 > size.x || 0 > size.y) throw new RangeError(`The size ${size} is out of range [(0, 0) - (+∞, +∞))`);
		this.#size = size;
		const position = Vector2D.newNaN;
		const data = (this.#data = new Array<T[]>(size.y));
		for (let y = 0; y < data.length; y++) {
			position.y = y;
			const row = (data[y] = new Array<T>(size.x));
			for (let x = 0; x < row.length; x++) {
				position.x = x;
				row[x] = initializer(position);
			}
		}
	}
	#size: Readonly<Vector2D>;
	/** 
	 * Gets the size of the matrix.
	 * @readonly 
	 */
	get size(): Readonly<Vector2D> {
		return this.#size;
	}
	#data: T[][];
	/**
	 * Gets the value at the specified position in the matrix.
	 * @param position The position to get the value from.
	 * @returns The value at the specified position.
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	get(position: Readonly<Vector2D>): T {
		if (!Vector.isInteger(position)) throw new TypeError(`The position ${position} must be a finite integer vector`);
		const { x, y } = position;
		const size = this.#size;
		if (0 > x || x >= size.x || 0 > y || y >= size.y) throw new RangeError(`The position ${position} is out of range [(0, 0) - ${size})`);
		return this.#data[y][x];
	}
	/**
	 * Sets the value at the specified position in the matrix.
	 * @param position The position to set the value at.
	 * @param value The value to set.
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	set(position: Readonly<Vector2D>, value: T): void {
		if (!Vector.isInteger(position)) throw new TypeError(`The position ${position} must be a finite integer vector`);
		const { x, y } = position;
		const size = this.#size;
		if (0 > x || x >= size.x || 0 > y || y >= size.y) throw new RangeError(`The position ${position} is out of range [(0, 0) - ${size})`);
		this.#data[y][x] = value;
	}
	/**
	 * Updates a value at a specified position using a callback.
	 * @param position The position to modify.
	 * @param callback Function to compute the new value.
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	change(position: Readonly<Vector2D>, callback: (value: T) => T): void {
		if (!Vector.isInteger(position)) throw new TypeError(`The position ${position} must be a finite integer vector`);
		const { x, y } = position;
		const size = this.#size;
		if (0 > x || x >= size.x || 0 > y || y >= size.y) throw new RangeError(`The position ${position} is out of range [(0, 0) - ${size})`);
		this.#data[y][x] = callback(this.#data[y][x]);
	}
	/**
	 * Iterates over each element in the matrix and applies a callback function.
	 */
	forEach(callback: (value: T, position: Vector2D, matrix: Matrix<T>) => void): void {
		const size = this.#size;
		const position = Vector2D.newNaN;
		for (let y = 0; y < size.y; y++) {
			for (let x = 0; x < size.x; x++) {
				position.x = x;
				position.y = y;
				callback(this.#data[y][x], position, this);
			}
		}
	}
}
//#endregion

export { Vector, Vector1D, Vector2D, Vector3D, Timespan, Matrix };
