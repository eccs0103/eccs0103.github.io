"use strict";
const { PI, trunc, pow } = Math;
Number.import = function (source, name = `source`) {
    if (typeof (source) !== `number`)
        throw new TypeError(`Unable to import ${name} due its ${ /* typename */(source)} type`);
    return source.valueOf();
};
Number.prototype.export = function () {
    return this.valueOf();
};
Number.prototype.clamp = function (min, max) {
    let value = this.valueOf();
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
};
Number.prototype.interpolate = function (min1, max1, min2 = 0, max2 = 1) {
    if (min1 === max1)
        throw new Error(`Minimum and maximum of the original range cant be equal`);
    if (min2 === max2)
        throw new Error(`Minimum and maximum of the target range cant be equal`);
    return min2 + (max2 - min2) * ((this.valueOf() - min1) / (max1 - min1));
};
Number.prototype.modulate = function (length, start = 0) {
    if (length === 0)
        throw new Error(`Range can't be zero`);
    let value = (this.valueOf() - start) % length;
    if (value < 0)
        value += length;
    return value + start;
};
Number.prototype.insteadNaN = function (value) {
    const current = this.valueOf();
    if (Number.isNaN(current))
        return value;
    return current;
};
Number.prototype.insteadInfinity = function (value) {
    const current = this.valueOf();
    if (!Number.isFinite(current))
        return value;
    return current;
};
Number.prototype.insteadZero = function (value) {
    const current = this.valueOf();
    if (!Number.isFinite(current))
        return value;
    if (current === 0)
        return value;
    return current;
};
Boolean.import = function (source, name = `source`) {
    if (typeof (source) !== `boolean`)
        throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
    return source.valueOf();
};
Boolean.prototype.export = function () {
    return this.valueOf();
};
String.import = function (source, name = `source`) {
    if (typeof (source) !== `string`)
        throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
    return source.valueOf();
};
Object.defineProperty(String, `empty`, {
    value: ``,
    writable: false,
});
String.isEmpty = function (text) {
    return (text.length === 0);
};
String.isWhitespace = function (text) {
    return String.isEmpty(text.trimStart());
};
String.prototype.export = function () {
    return this.valueOf();
};
String.prototype.insteadEmpty = function (value) {
    const current = this.valueOf();
    if (String.isEmpty(current))
        return value;
    return current;
};
String.prototype.insteadWhitespace = function (value) {
    const current = this.valueOf();
    if (String.isWhitespace(current))
        return value;
    return current;
};
const patternWordsFirstLetter = /\b\w/g;
String.prototype.toTitleCase = function () {
    return this.toLowerCase().replace(patternWordsFirstLetter, char => char.toUpperCase());
};
String.prototype.toLocalTitleCase = function (locales) {
    return this.toLocaleLowerCase(locales).replace(patternWordsFirstLetter, char => char.toLocaleUpperCase(locales));
};
String.prototype.reverse = function () {
    let string = String.empty;
    for (let index = this.length - 1; index >= 0; index--) {
        string += this[index];
    }
    return string;
};
Object.import = function (source, name = `source`) {
    if (typeof (source) !== `object` || source === null)
        throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
    return source.valueOf();
};
Object.map = function (value, callback) {
    if (value === null || value === undefined)
        return value;
    else
        return callback(value);
};
Object.suppress = function (value, name = `value`) {
    switch (value) {
        case null: throw new Error(`${name.toTitleCase()} mustn't be null`);
        case undefined: throw new Error(`${name.toTitleCase()} mustn't be undefined`);
        default: return value;
    }
};
Object.prototype.export = function () {
    return this.valueOf();
};
Iterator.range = function* (min, max) {
    min = trunc(min);
    max = trunc(max);
    for (let index = 0; index < max - min; index++) {
        yield index + min;
    }
};
Array.import = function (source, name = `source`) {
    if (!(source instanceof Array))
        throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
    return Array.from(source);
};
Array.range = function (min, max) {
    return Array.from(Iterator.range(min, max));
};
Array.prototype.export = function () {
    return Array.from(this);
};
Array.prototype.swap = function (index1, index2) {
    index1 = trunc(index1);
    index2 = trunc(index2);
    const temporary = this[index1];
    this[index1] = this[index2];
    this[index2] = temporary;
};
Array.prototype.resize = function (length, _default) {
    while (length > this.length)
        this.push(_default);
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
class DataPair {
    /**
     * Creates a DataPair instance from an array containing a key-value pair.
     * @param source The source array containing the key-value pair.
     * @returns A new DataPair instance.
     */
    static fromArray(source) {
        const [key, value] = source;
        return new DataPair(key, value);
    }
    /**
     * Converts the DataPair instance to an array containing the key-value pair.
     * @returns The key-value pair as an array.
     */
    toArray() {
        return [this.#key, this.#value];
    }
    /**
     * @param key The key of the data pair.
     * @param value The value of the data pair.
     */
    constructor(key, value) {
        this.#key = key;
        this.#value = value;
    }
    #key;
    /**
     * Gets the key of the data pair.
     * @readonly
     */
    get key() {
        return this.#key;
    }
    #value;
    /**
     * Gets the value of the data pair.
     */
    get value() {
        return this.#value;
    }
    /**
     * Sets the value of the data pair.
     */
    set value(value) {
        this.#value = value;
    }
}
Math.split = function (x) {
    const integer = trunc(x);
    return [integer, (x - integer)];
};
Math.sqpw = function (x) {
    return x * x;
};
const toDegreeFactor = 180 / PI;
Math.toDegrees = function (radians) {
    return radians * toDegreeFactor;
};
const toRadianFactor = PI / 180;
Math.toRadians = function (degrees) {
    return degrees * toRadianFactor;
};
Math.meanArithmetic = function (...values) {
    let summary = 0;
    for (let index = 0; index < values.length; index++) {
        summary += values[index];
    }
    return summary / values.length;
};
Math.meanGeometric = function (...values) {
    let product = 1;
    for (let index = 0; index < values.length; index++) {
        product *= values[index];
    }
    return pow(product, 1 / values.length);
};
Math.meanHarmonic = function (...values) {
    let summary = 0;
    for (let index = 0; index < values.length; index++) {
        const value = values[index];
        if (value === 0)
            return NaN;
        summary += 1 / value;
    }
    return values.length / summary;
};
Object.defineProperty(Promise.prototype, `isFulfilled`, {
    async get() {
        const symbol = Symbol();
        try {
            return (await Promise.race([this, Promise.resolve(symbol)]) !== symbol);
        }
        catch (reason) {
            return true;
        }
    }
});
Object.defineProperty(Promise.prototype, `value`, {
    async get() {
        try {
            return await this;
        }
        catch (reason) {
            throw new Error(`Unable to get value of rejected promise`);
        }
    }
});
Object.defineProperty(Promise.prototype, `reason`, {
    async get() {
        try {
            await this;
            throw new Error(`Unable to get reason of resolved promise`);
        }
        catch (reason) {
            return reason;
        }
    }
});
//#endregion
//#region Promise factory
/**
 * A factory that allows running promises with a custom executor.
 */
class PromiseFactory {
    /**
     * @param executor The executor function that takes two arguments: resolve and reject.
     */
    constructor(executor) {
        this.#executor = executor;
    }
    #executor;
    /**
     * Runs the promise using the provided executor.
     * @returns The promise that resolves with the value produced by the executor.
     */
    async run() {
        const { promise, resolve, reject } = Promise.withResolvers();
        this.#executor.call(promise, resolve, reject);
        return await promise;
    }
    /**
     * Repeatedly runs the promise until the given predicate returns true.
     * @param predicate A function that tests the resolved value.
     * @returns The promise that resolves when the predicate is true.
     */
    async runUntil(predicate) {
        while (true) {
            try {
                const result = await this.run();
                if (!predicate(result))
                    continue;
                return result;
            }
            catch {
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
    async runMapping(callback) {
        while (true) {
            try {
                return callback(await this.run());
            }
            catch {
                continue;
            }
        }
    }
}
Error.from = function (reason) {
    return reason instanceof Error ? reason : new Error(reason ?? `Undefined reason`);
};
Error.throws = function (reason = undefined) {
    throw Error.from(reason);
};
Error.prototype.toString = function () {
    let text = this.stack ?? `${this.name}: ${this.message}`;
    if (this.cause !== undefined)
        text += ` cause of:\n\r${Error.from(this.cause)}`;
    return text;
};
//#endregion
//#region Implementation error
class ImplementationError extends ReferenceError {
    /**
     * @param options
     */
    constructor(options = {}) {
        super(`Not implemented function`, options);
        if (new.target !== ImplementationError)
            throw new TypeError(`Unable to create an instance of sealed-extended class`);
        this.name = `ImplementationError`;
    }
}
globalThis.prototype = function (value) {
    return value.constructor;
};
globalThis.typename = function (value) {
    switch (value) {
        case undefined:
        case null: return String(value).toTitleCase();
        default: return prototype(value).name;
    }
};
/**
 * Abstract base class representing a controller with lifecycle hooks.
 */
class Controller {
    //#region Factory
    /**
     * A factory class for building and executing controllers.
     */
    static Factory = class ControllerFactory {
        /**
         * @throws {TypeError} If the constructor is called.
         */
        constructor() {
            throw new TypeError("Illegal constructor");
        }
        static async #run(controller) {
            try {
                await controller.run();
            }
            catch (reason) {
                await controller.catch(Error.from(reason));
            }
        }
        /**
         * Builds and runs the provided controller.
         */
        static build(controller) {
            Controller.Factory.#run(controller);
        }
    };
    //#endregion
    /**
     * @throws {TypeError} If instantiated directly instead of via subclass.
     */
    constructor() {
        if (new.target === Controller)
            throw new TypeError("Unable to create an instance of an abstract class");
    }
    /**
     * Called to run the controller logic.
     */
    async run() {
    }
    /**
     * Called when an error occurs during controller execution.
     * @param error The error that was thrown.
     */
    async catch(error) {
    }
}
//#endregion
export { DataPair, PromiseFactory, ImplementationError, Controller };
