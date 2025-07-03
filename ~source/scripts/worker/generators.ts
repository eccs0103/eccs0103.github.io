"use strict";

import { ImplementationError } from "../core/extensions.js";

const { trunc } = Math;

//#region Engine
interface EngineEventMap {
	"start": Event;
	"trigger": Event;
	"launch": Event;
	"change": Event;
}

/**
 * Base class for engines.
 * @abstract
 */
abstract class Engine extends EventTarget {
	constructor() {
		super();
		if (new.target === Engine) throw new TypeError(`Unable to create an instance of an abstract class`);
	}
	addEventListener<K extends keyof EngineEventMap>(type: K, listener: (this: Engine, ev: EngineEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | AddEventListenerOptions = false): void {
		return super.addEventListener(type, listener, options);
	}
	removeEventListener<K extends keyof EngineEventMap>(type: K, listener: (this: Engine, ev: EngineEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | EventListenerOptions = false): void {
		return super.removeEventListener(type, listener, options);
	}
	/**
	 * Gets the launch status of the engine.
	 * @abstract
	 */
	get launched(): boolean {
		throw new ImplementationError();
	}
	/**
	 * Sets the launch status of the engine.
	 * @abstract
	 */
	set launched(value: boolean) {
		throw new ImplementationError();
	}
	/**
	 * Gets the FPS limit of the engine.
	 * @abstract
	 */
	get limit(): number {
		throw new ImplementationError();
	}
	/**
	 * Sets the FPS limit of the engine.
	 * @abstract
	 */
	set limit(value: number) {
		throw new ImplementationError();
	}
	/**
	 * Gets the Frames Per Second  of the engine.
	 * @abstract
	 * @readonly
	 */
	get fps(): number {
		throw new ImplementationError();
	}
	/**
	 * Gets the time delta between frames.
	 * @abstract
	 * @readonly
	 */
	get delta(): number {
		throw new ImplementationError();
	}
}
//#endregion
//#region Fast engine
interface FastEngineEventMap extends EngineEventMap {
}

/**
 * Constructs a fast type engine.
 */
class FastEngine extends Engine {
	constructor() {
		super();

		this.addEventListener(`trigger`, event => this.dispatchEvent(new Event(`start`)), { once: true });
		requestAnimationFrame(this.#callback.bind(this));
	}
	addEventListener<K extends keyof FastEngineEventMap>(type: K, listener: (this: FastEngine, ev: FastEngineEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | AddEventListenerOptions = false): void {
		return super.addEventListener(type, listener, options);
	}
	removeEventListener<K extends keyof FastEngineEventMap>(type: K, listener: (this: FastEngine, ev: FastEngineEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | EventListenerOptions = false): void {
		return super.removeEventListener(type, listener, options);
	}
	#launched: boolean = false;
	/**
	 * Gets the launch status of the engine.
	 */
	get launched(): boolean {
		return this.#launched;
	}
	/**
	 * Sets the launch status of the engine.
	 */
	set launched(value: boolean) {
		const previous = this.#launched;
		this.#launched = value;
		if (previous !== value) this.dispatchEvent(new Event(`change`));
		if (value) this.dispatchEvent(new Event(`launch`));
	}
	#previous: number = 0;
	#callback(current: DOMHighResTimeStamp): void {
		const difference = current - this.#previous;
		if (difference > this.#gap) {
			if (this.launched) {
				this.#fps = (1000 / difference);
				this.dispatchEvent(new Event(`trigger`));
			} else {
				this.#fps = 0;
			}
			this.#previous = current;
		}
		requestAnimationFrame(this.#callback.bind(this));
	}
	#gap: number = 0;
	/**
	 * Gets the FPS limit of the engine.
	 */
	get limit(): number {
		return 1000 / this.#gap;
	}
	/**
	 * Sets the FPS limit of the engine.
	 */
	set limit(value: number) {
		if (Number.isNaN(value)) return;
		if (value <= 0) return;
		this.#gap = 1000 / value;
	}
	#fps: number = 0;
	/**
	 * Gets the current FPS of the engine.
	 * @readonly
	 */
	get fps(): number {
		return this.#fps;
	}
	/**
	 * Gets the time delta between frames.
	 * @readonly
	 */
	get delta(): number {
		return 1 / this.#fps;
	}
}
//#endregion
//#region Precise engine
interface PreciseEngineEventMap extends EngineEventMap {
}

/**
 * Constructs a precise type engine.
 */
class PreciseEngine extends Engine {
	constructor() {
		super();

		this.addEventListener(`trigger`, event => this.dispatchEvent(new Event(`start`)), { once: true });
		setTimeout(this.#callback.bind(this), this.#gap, performance.now());
	};
	addEventListener<K extends keyof PreciseEngineEventMap>(type: K, listener: (this: PreciseEngine, ev: PreciseEngineEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | AddEventListenerOptions = false): void {
		return super.addEventListener(type, listener, options);
	}
	removeEventListener<K extends keyof PreciseEngineEventMap>(type: K, listener: (this: PreciseEngine, ev: PreciseEngineEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | EventListenerOptions = false): void {
		return super.removeEventListener(type, listener, options);
	}
	#launched: boolean = false;
	/**
	 * Gets the launch status of the engine.
	 */
	get launched(): boolean {
		return this.#launched;
	}
	/**
	 * Sets the launch status of the engine.
	 */
	set launched(value: boolean) {
		const previous = this.#launched;
		this.#launched = value;
		if (previous !== value) this.dispatchEvent(new Event(`change`));
		if (value) this.dispatchEvent(new Event(`launch`));
	}
	#previous: number = performance.now();
	#callback(current: DOMHighResTimeStamp): void {
		const difference = current - this.#previous;
		if (this.launched) {
			this.#fps = (1000 / difference);
			this.dispatchEvent(new Event(`trigger`));
		} else {
			this.#fps = 0;
		}
		this.#previous = current;
		setTimeout(this.#callback.bind(this), this.#gap, performance.now());
	}
	#gap: number = 0;
	/**
	 * Gets the FPS limit of the engine.
	 */
	get limit(): number {
		return 1000 / this.#gap;
	}
	/**
	 * Sets the FPS limit of the engine.
	 */
	set limit(value: number) {
		if (Number.isNaN(value)) return;
		if (value <= 0) return;
		this.#gap = 1000 / value;
	}
	#fps: number = 0;
	/**
	 * Gets the current FPS of the engine.
	 * @readonly
	 */
	get fps(): number {
		return this.#fps;
	}
	/**
	 * Gets the time delta between frames.
	 * @readonly
	 */
	get delta(): number {
		return 1 / this.#fps;
	}
}
//#endregion
//#region Static engine
interface StaticEngineEventMap extends EngineEventMap {
}

/**
 * Constructs a static type engine.
 */
class StaticEngine extends Engine {
	constructor() {
		super();

		this.addEventListener(`trigger`, event => this.dispatchEvent(new Event(`start`)), { once: true });
		setTimeout(this.#callback.bind(this));
	}
	addEventListener<K extends keyof StaticEngineEventMap>(type: K, listener: (this: StaticEngine, ev: StaticEngineEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | AddEventListenerOptions = false): void {
		return super.addEventListener(type, listener, options);
	}
	removeEventListener<K extends keyof StaticEngineEventMap>(type: K, listener: (this: StaticEngine, ev: StaticEngineEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | EventListenerOptions = false): void {
		return super.removeEventListener(type, listener, options);
	}
	#launched: boolean = false;
	/**
	 * Gets the launch status of the engine.
	 */
	get launched(): boolean {
		return this.#launched;
	}
	/**
	 * Sets the launch status of the engine.
	 */
	set launched(value: boolean) {
		const previous = this.#launched;
		this.#launched = value;
		if (previous !== value) this.dispatchEvent(new Event(`change`));
		if (value) this.dispatchEvent(new Event(`launch`));
	}
	#previous: number = 0;
	#callback(): void {
		const current = performance.now();
		const difference = current - this.#previous;
		const count = trunc(difference / this.#gap);
		this.#delta = difference / count;
		for (let index = 0; index < count; index++) {
			if (this.launched) this.dispatchEvent(new Event(`trigger`));
			this.#previous = current;
		}
		setTimeout(this.#callback.bind(this));
	};
	#gap: number = 1000 / 120;
	/**
	 * Gets the FPS limit of the engine.
	 */
	get limit(): number {
		return 1000 / this.#gap;
	}
	/**
	 * Sets the FPS limit of the engine.
	 */
	set limit(value: number) {
		if (Number.isNaN(value)) return;
		if (value <= 0) return;
		this.#gap = 1000 / value;
		this.#delta = this.#gap;
	}
	#delta: number = this.#gap;
	/**
	 * Gets the current FPS of the engine.
	 * @readonly
	 */
	get fps(): number {
		return 1000 / this.#delta;
	}
	/**
	 * Gets the time delta between frames.
	 * @readonly
	 */
	get delta(): number {
		return this.#delta / 1000;
	}
}
//#endregion

//#region Socket package
interface SocketPackageNotation {
	type: string;
	rejected: boolean;
	details: object;
}

/**
 * Represents a structured data package for communication over sockets.
 */
class SocketPackage {
	/**
	 * Imports a SocketPackage from a given source object.
	 * @param source The object to import as a SocketPackage.
	 * @param name An optional name for the source, used in error messages.
	 * @returns A new instance of SocketPackage.
	 * @throws {TypeError} If the source cannot be imported as a SocketPackage.
	 */
	static import(source: any, name: string = `source`): SocketPackage {
		try {
			const shell = Object.import(source);
			const type = String.import(Reflect.get(shell, `type`), `property type`);
			const rejected = Boolean.import(Reflect.get(shell, `rejected`), `property rejected`);
			const details = Reflect.get(shell, `details`);
			return new SocketPackage(type, details, rejected);
		} catch (reason) {
			throw new TypeError(`Unable to import ${(name)} due its ${typename(source)} type`, { cause: reason });
		}
	}
	/**
	 * Exports the current SocketPackage instance as a plain object.
	 * @returns The exported package notation.
	 */
	export(): SocketPackageNotation {
		return {
			type: this.#type.export(),
			rejected: this.#rejected.export(),
			details: this.#details
		};
	}
	/**
	 * @param type The type of the package.
	 * @param details The details or payload of the package.
	 * @param rejected Whether the package is rejected.
	 */
	constructor(type: string, details: any = null, rejected: boolean = false) {
		this.#type = type;
		this.#details = details;
		this.#rejected = rejected;
	}
	#type: string;
	/**
	 * Gets the type of the package.
	 * @readonly
	 */
	get type(): string {
		return this.#type;
	}
	#rejected: boolean;
	/**
	 * Gets the rejection status of the package.
	 * @readonly
	 */
	get rejected(): boolean {
		return this.#rejected;
	}
	#details: any;
	/**
	 * Gets the details of the package.
	 * @readonly
	 */
	get details(): any {
		return this.#details;
	}
}
//#endregion
//#region Socket manager
interface SocketManagerEventMap {
	"connect": Event;
	"disconnect": Event;
}

/**
 * Manages WebSocket connections and provides methods for sending and receiving messages.
 * This class extends the `EventTarget` API to handle connection events.
 */
class SocketManager extends EventTarget {
	/**
	 * @param url The URL for the WebSocket connection.
	 */
	constructor(url: string | URL) {
		super();

		this.#url = url;
		this.#connect(0);
	}
	addEventListener<K extends keyof SocketManagerEventMap>(type: K, listener: (this: SocketManager, ev: SocketManagerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | AddEventListenerOptions = false): void {
		return super.addEventListener(type, listener, options);
	}
	removeEventListener<K extends keyof SocketManagerEventMap>(type: K, listener: (this: SocketManager, ev: SocketManagerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | EventListenerOptions = false): void {
		return super.removeEventListener(type, listener, options);
	}
	#url: string | URL;
	#socket: WebSocket | null = null;
	async #connect(attempt: number): Promise<void> {
		try {
			const socket = this.#socket = new WebSocket(this.#url);
			await Promise.withSignal<void>((signal, resolve, reject) => {
				socket.addEventListener(`open`, (event) => resolve(), { signal });
				socket.addEventListener(`error`, (event) => reject(Reflect.get(event, `error`)), { signal });
				socket.addEventListener(`close`, (event) => reject(event.reason), { signal });
			});
			this.dispatchEvent(new Event(`connect`));
		} catch (reason) {
			await this.#connect(attempt + 1);
		}
		this.#observe();
	}
	async #observe(): Promise<void> {
		const socket = this.#socket;
		if (socket === null) return;
		await Promise.withSignal((signal, resolve) => {
			socket.addEventListener(`error`, (event) => resolve(Reflect.get(event, `error`)), { signal });
			socket.addEventListener(`close`, (event) => resolve(event.reason), { signal });
		});
		this.dispatchEvent(new Event(`disconnect`));
		this.#connect(0);
	}
	/**
	 * Sends a message to the server and waits for a response.
	 * @param type The type of the message.
	 * @param details The payload of the message.
	 * @returns Resolves with the response details.
	 * @throws {Error} If the socket is not connected or an error occurs.
	 */
	async send(type: string, details: any = null): Promise<object> {
		const socket = this.#socket;
		if (socket === null || socket.readyState !== WebSocket.OPEN) throw new Error(`Socket is not connected.`);
		const promiseResponse = Promise.withSignal<object>((signal, resolve, reject) => {
			socket.addEventListener(`message`, ({ data }) => {
				const response = SocketPackage.import(JSON.parse(data));
				if (response.type !== type) return;
				if (response.rejected) reject(response.details);
				resolve(response.details);
			}, { signal });
		});
		socket.send(JSON.stringify(new SocketPackage(type, details).export()));
		return await promiseResponse;
	}
}
//#endregion

export { Engine, FastEngine, PreciseEngine, StaticEngine, SocketManager };
