"use strict";

import { FastEngine } from "./generators.js";

//#region Timer
interface TimerEventMap {
	"trigger": Event;
}

/**
 * A Timer class that triggers events based on a countdown mechanism.
 * It supports both single and repeated countdowns and allows subscribing to updates through events.
 */
class Timer extends EventTarget {
	/**
	 * @param multiple Determines whether the timer can trigger multiple times.
	 */
	constructor(multiple: boolean = false) {
		super();

		this.#multiple = multiple;
		setInterval(this.#callback.bind(this));
	}
	addEventListener<K extends keyof TimerEventMap>(type: K, listener: (this: Timer, ev: TimerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | AddEventListenerOptions = false): void {
		return super.addEventListener(type, listener, options);
	}
	removeEventListener<K extends keyof TimerEventMap>(type: K, listener: (this: Timer, ev: TimerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | EventListenerOptions = false): void {
		return super.removeEventListener(type, listener, options);
	}
	#multiple: boolean;
	#remaining: number = 0;
	/**
	 * Gets the remaining time in milliseconds.
	 * @readonly
	 */
	get remaining(): number {
		return this.#remaining;
	}
	/**
	 * Sets the timer to trigger after a specific timeout.
	 * @param milliseconds The timeout duration in milliseconds.
	 */
	setTimeout(milliseconds: number = 0): void {
		this.#remaining = milliseconds.clamp(0, Infinity);
	}
	#previous: number = performance.now();
	#callback(): void {
		if (!this.#multiple && this.#remaining === 0) return;
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
	#elapsed: DOMHighResTimeStamp = 0;
	/**
	 * Gets the elapsed time as milliseconds.
	 * @readonly
	 */
	get elapsed(): DOMHighResTimeStamp {
		return this.#elapsed;
	}
	/**
	 * Resets the elapsed time to zero.
	 */
	reset(): void {
		this.#elapsed = 0;
	}
	#launched: boolean = false;
	/**
	 * Gets the launched state of the stopwatch.
	 */
	get launched(): boolean {
		return this.#launched;
	}
	/**
	 * Sets the launched state of the stopwatch.
	 */
	set launched(value: boolean) {
		this.#launched = value;
	}
	#previous: number = performance.now();
	#callback(current: DOMHighResTimeStamp): void {
		if (this.#launched) {
			this.#elapsed += current - this.#previous;
		}
		this.#previous = current;
	}
}
//#endregion

export { Timer, Stopwatch };
