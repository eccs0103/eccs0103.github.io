"use strict";
import { FastEngine } from "./generators.js";
/**
 * A Timer class that triggers events based on a countdown mechanism.
 * It supports both single and repeated countdowns and allows subscribing to updates through events.
 */
class Timer extends EventTarget {
    /**
     * @param multiple Determines whether the timer can trigger multiple times.
     */
    constructor(multiple = false) {
        super();
        this.#multiple = multiple;
        setInterval(this.#callback.bind(this));
    }
    addEventListener(type, listener, options = false) {
        return super.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener, options = false) {
        return super.removeEventListener(type, listener, options);
    }
    #multiple;
    #remaining = 0;
    /**
     * Gets the remaining time in milliseconds.
     * @readonly
     */
    get remaining() {
        return this.#remaining;
    }
    /**
     * Sets the timer to trigger after a specific timeout.
     * @param milliseconds The timeout duration in milliseconds.
     */
    setTimeout(milliseconds = 0) {
        this.#remaining = milliseconds.clamp(0, Infinity);
    }
    #previous = performance.now();
    #callback() {
        if (!this.#multiple && this.#remaining === 0)
            return;
        const current = performance.now();
        const difference = current - this.#previous;
        this.#remaining -= difference;
        if (this.#remaining <= 0) {
            this.#remaining = 0;
            this.dispatchEvent(new Event(`trigger`));
        }
        this.#previous = current;
    }
}
//#endregion
//#region Stopwatch
/**
 * A class representing a stopwatch to measure time durations.
 */
class Stopwatch {
    constructor() {
        const engine = new FastEngine();
        engine.launched = true;
        engine.addEventListener(`trigger`, event => this.#callback(performance.now()));
    }
    #elapsed = 0;
    /**
     * Gets the elapsed time as milliseconds.
     * @readonly
     */
    get elapsed() {
        return this.#elapsed;
    }
    /**
     * Resets the elapsed time to zero.
     */
    reset() {
        this.#elapsed = 0;
    }
    #launched = false;
    /**
     * Gets the launched state of the stopwatch.
     */
    get launched() {
        return this.#launched;
    }
    /**
     * Sets the launched state of the stopwatch.
     */
    set launched(value) {
        this.#launched = value;
    }
    #previous = performance.now();
    #callback(current) {
        if (this.#launched) {
            this.#elapsed += current - this.#previous;
        }
        this.#previous = current;
    }
}
//#endregion
export { Timer, Stopwatch };
