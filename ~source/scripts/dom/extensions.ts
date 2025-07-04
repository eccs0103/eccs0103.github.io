"use strict";

import { Controller } from "../core/extensions.js";
import "../worker/extensions.js";
import { bSubtitle, dialogLoader } from "./loader.js";
import { buttonConfirmAccept, buttonConfirmDecline, buttonPromptAccept, dialogAlert, dialogConfirm, dialogPrompt, divAlertCoontainer, divConfirmContainer, divPromptContainer, inputPrompt } from "./popup.js";

//#region Parent node
declare global {
	interface ParentNode {
		/**
		 * Retrieves an element of the specified type and selectors.
		 * @template T
		 * @param type The type of element to retrieve.
		 * @param selectors The selectors to search for the element.
		 * @returns The element instance.
		 * @throws {TypeError} If the element is missing or has an invalid type.
		 */
		getElement<T extends typeof Element>(type: T, selectors: string): InstanceType<T>;
		/**
		 * Asynchronously retrieves an element of the specified type and selectors.
		 * @template T
		 * @param type The type of element to retrieve.
		 * @param selectors The selectors to search for the element.
		 * @returns The element instance.
		 * @throws {TypeError} If the element is missing or has an invalid type.
		 */
		getElementAsync<T extends typeof Element>(type: T, selectors: string): Promise<InstanceType<T>>;
		/**
		 * Retrieves elements of the specified type and selectors.
		 * @template T
		 * @param type The type of elements to retrieve.
		 * @param selectors The selectors to search for the elements.
		 * @returns The NodeList of element instances.
		 * @throws {TypeError} If any element is missing or has an invalid type.
		 */
		getElements<T extends typeof Element>(type: T, selectors: string): NodeListOf<InstanceType<T>>;
		/**
		 * Asynchronously retrieves elements of the specified type and selectors.
		 * @template T
		 * @param type The type of elements to retrieve.
		 * @param selectors The selectors to search for the elements.
		 * @returns The NodeList of element instances.
		 * @throws {TypeError} If any element is missing or has an invalid type.
		 */
		getElementsAsync<T extends typeof Element>(type: T, selectors: string): Promise<NodeListOf<InstanceType<T>>>;
	}
}

Element.prototype.getElement = function <T extends typeof Element>(type: T, selectors: string): InstanceType<T> {
	const element = this.querySelector(selectors);
	if (element instanceof type) return element as InstanceType<T>;
	else throw new TypeError(`Element ${selectors} is missing or has invalid type`);
};

Element.prototype.getElementAsync = function <T extends typeof Element>(type: T, selectors: string): Promise<InstanceType<T>> {
	return Promise.resolve(this.getElement(type, selectors));
};

Element.prototype.getElements = function <T extends typeof Element>(type: T, selectors: string): NodeListOf<InstanceType<T>> {
	const elements = this.querySelectorAll(selectors);
	if (Array.from(elements).every(element => element instanceof type)) return elements as NodeListOf<InstanceType<T>>;
	else throw new TypeError(`Element ${selectors} is missing or has invalid type`);
};

Element.prototype.getElementsAsync = function <T extends typeof Element>(type: T, selectors: string): Promise<NodeListOf<InstanceType<T>>> {
	return Promise.resolve(this.getElements(type, selectors));
};

Document.prototype.getElement = function <T extends typeof Element>(type: T, selectors: string): InstanceType<T> {
	return this.documentElement.getElement(type, selectors);
};

Document.prototype.getElementAsync = function <T extends typeof Element>(type: T, selectors: string): Promise<InstanceType<T>> {
	return this.documentElement.getElementAsync(type, selectors);
};

Document.prototype.getElements = function <T extends typeof Element>(type: T, selectors: string): NodeListOf<InstanceType<T>> {
	return this.documentElement.getElements(type, selectors);
};

Document.prototype.getElementsAsync = function <T extends typeof Element>(type: T, selectors: string): Promise<NodeListOf<InstanceType<T>>> {
	return this.documentElement.getElementsAsync(type, selectors);
};

DocumentFragment.prototype.getElement = function <T extends typeof Element>(type: T, selectors: string): InstanceType<T> {
	const element = this.querySelector(selectors);
	if (element instanceof type) return element as InstanceType<T>;
	else throw new TypeError(`Element ${selectors} is missing or has invalid type`);
};

DocumentFragment.prototype.getElementAsync = function <T extends typeof Element>(type: T, selectors: string): Promise<InstanceType<T>> {
	return Promise.resolve(this.getElement(type, selectors));
};

DocumentFragment.prototype.getElements = function <T extends typeof Element>(type: T, selectors: string): NodeListOf<InstanceType<T>> {
	const elements = this.querySelectorAll(selectors);
	if (Array.from(elements).every(element => element instanceof type)) return elements as NodeListOf<InstanceType<T>>;
	else throw new TypeError(`Element ${selectors} is missing or has invalid type`);
};

DocumentFragment.prototype.getElementsAsync = function <T extends typeof Element>(type: T, selectors: string): Promise<NodeListOf<InstanceType<T>>> {
	return Promise.resolve(this.getElements(type, selectors));
};
//#endregion
//#region Element
declare global {
	interface Element {
		/**
		 * Retrieves the closest ancestor element of the specified type and selectors.
		 * @template T
		 * @param type The type of element to retrieve.
		 * @param selectors The selectors to search for the element.
		 * @returns The element instance.
		 * @throws {TypeError} If the element is missing or has an invalid type.
		 */
		getClosest<T extends typeof Element>(type: T, selectors: string): InstanceType<T>;
		/**
		 * Asynchronously retrieves the closest ancestor element of the specified type and selectors.
		 * @template T
		 * @param type The type of element to retrieve.
		 * @param selectors The selectors to search for the element.
		 * @returns The element instance.
		 * @throws {TypeError} If the element is missing or has an invalid type.
		 */
		getClosestAsync<T extends typeof Element>(type: T, selectors: string): Promise<InstanceType<T>>;
	}
}

Element.prototype.getClosest = function <T extends typeof Element>(type: T, selectors: string): InstanceType<T> {
	const element = this.closest(selectors);
	if (element instanceof type) return element as InstanceType<T>;
	else throw new TypeError(`Element ${selectors} is missing or has invalid type`);
};

Element.prototype.getClosestAsync = function <T extends typeof Element>(type: T, selectors: string): Promise<InstanceType<T>> {
	return Promise.resolve(this.getClosest(type, selectors));
};
//#endregion
//#region Document
declare global {
	interface Document {
		/**
		 * Asynchronously loads an image from the specified URL.
		 * @param url The URL of the image to be loaded.
		 * @returns A promise that resolves with the loaded image element.
		 * @throws {Error} If the image fails to load.
		 */
		loadImage(url: string): Promise<HTMLImageElement>;
		/**
		 * Asynchronously loads multiple images from the provided URLs.
		 * @param urls An array of image URLs to be loaded.
		 * @returns A promise that resolves with an array of loaded image elements.
		 * @throws {Error} If any image fails to load.
		 */
		loadImages(urls: string[]): Promise<HTMLImageElement[]>;
	}
}

Document.prototype.loadImage = async function (url: string): Promise<HTMLImageElement> {
	const image = new Image();
	const promise = Promise.withSignal((signal, resolve, reject) => {
		image.addEventListener(`load`, (event) => resolve(undefined), { signal });
		image.addEventListener(`error`, (event) => reject(Error.from(event.error)), { signal });
	});
	image.src = url;
	await promise;
	return image;
};

Document.prototype.loadImages = async function (urls: string[]): Promise<HTMLImageElement[]> {
	return await Promise.all(urls.map(url => this.loadImage(url)));
};
//#endregion
//#region Window
declare global {
	interface Window {
		/**
		 * Asynchronously displays an alert message.
		 * @param message The message to display.
		 * @returns A promise that resolves when the alert is closed.
		 */
		alertAsync(message?: any): Promise<void>;
		/**
		 * Asynchronously displays a confirmation dialog.
		 * @param message The message to display.
		 * @returns A promise that resolves to true if the user confirms, and false otherwise.
		 */
		confirmAsync(message?: string): Promise<boolean>;
		/**
		 * Asynchronously displays a prompt dialog.
		 * @param message The message to display.
		 * @returns A promise that resolves to the user's input value if accepted, or null if canceled.
		 */
		promptAsync(message?: string, _default?: string): Promise<string | null>;
		/**
		 * Asynchronously loads a promise with a loading animation.
		 * @template T
		 * @param promise The promise to load.
		 * @param delay The delay before the loading animation starts.
		 * @param duration The duration of the loading animation.
		 * @returns A promise that resolves to the result of the input promise.
		 */
		load<T>(promise: Promise<T>, delay?: number, duration?: number): Promise<T>;
	}

	/**
	 * Asynchronously displays an alert message.
	 * @param message The message to display.
	 * @param title The title of the alert.
	 * @returns A promise that resolves when the alert is closed.
	 */
	function alertAsync(message?: any): Promise<void>;
	/**
	 * Asynchronously displays a confirmation dialog.
	 * @param message The message to display.
	 * @param title The title of the confirmation dialog.
	 * @returns A promise that resolves to true if the user confirms, and false otherwise.
	 */
	function confirmAsync(message?: string): Promise<boolean>;
	/**
	 * Asynchronously displays a prompt dialog.
	 * @param message The message to display.
	 * @param title The title of the prompt dialog.
	 * @returns A promise that resolves to the user's input value if accepted, or null if canceled.
	 */
	function promptAsync(message?: string, _default?: string): Promise<string | null>;
	/**
	 * Executes an action and handles any errors that occur.
	 * @param action The action to be executed.
	 * @param silent In silent mode errors are silently ignored; otherwise, they are thrown and the page is reloaded.
	 * @returns A promise that resolves the action.
	 */
	function assert(action: VoidFunction, silent?: boolean): Promise<void>;
	/**
	 * Asynchronously loads a promise with a loading animation.
	 * @template T
	 * @param promise The promise to load.
	 * @param duration The duration of the loading animation.
	 * @param delay The delay before the loading animation starts.
	 * @returns A promise that resolves to the result of the input promise.
	 */
	function load<T>(promise: Promise<T>, duration?: number, delay?: number): Promise<T>;
}

let isAlertComposed = false;
dialogAlert.addEventListener(`click`, (event) => {
	if (event.target !== dialogAlert) return;
	isAlertComposed = true;
	dialogAlert.close();
});
Window.prototype.alertAsync = async function (message: any = String.empty): Promise<void> {
	dialogAlert.showModal();
	divAlertCoontainer.innerText = String(message);
	try {
		return await Promise.withSignal((signal, resolve) => {
			dialogAlert.addEventListener(`close`, event => (isAlertComposed ? resolve() : null), { signal });
		});
	} finally {
		isAlertComposed = false;
		dialogAlert.close();
	}
};

let isConfirmComposed = false;
dialogConfirm.addEventListener(`click`, (event) => {
	if (event.target !== dialogConfirm) return;
	isConfirmComposed = true;
	dialogConfirm.close();
});
Window.prototype.confirmAsync = async function (message: string = String.empty): Promise<boolean> {
	dialogConfirm.showModal();
	divConfirmContainer.innerText = message;
	try {
		return await Promise.withSignal((signal, resolve) => {
			buttonConfirmAccept.addEventListener(`click`, event => resolve(true), { signal });
			buttonConfirmDecline.addEventListener(`click`, event => resolve(false), { signal });
			dialogConfirm.addEventListener(`close`, event => (isConfirmComposed ? resolve(false) : null), { signal });
		});
	} finally {
		isConfirmComposed = false;
		dialogConfirm.close();
	}
};

let isPromptComposed = false;
dialogPrompt.addEventListener(`click`, (event) => {
	if (event.target !== dialogPrompt) return;
	isPromptComposed = true;
	dialogPrompt.close();
});
Window.prototype.promptAsync = async function (message: string = String.empty, _default = String.empty): Promise<string | null> {
	dialogPrompt.showModal();
	divPromptContainer.innerText = message;
	inputPrompt.value = _default;
	try {
		return await Promise.withSignal((signal, resolve) => {
			buttonPromptAccept.addEventListener(`click`, event => resolve(inputPrompt.value), { signal });
			dialogPrompt.addEventListener(`close`, event => (isPromptComposed ? resolve(null) : null), { signal });
		});
	} finally {
		isPromptComposed = false;
		dialogPrompt.close();
	}
};

void async function () {
	const subtitle = bSubtitle.innerText;
	const period = 4;
	let counter = 0;
	while (true) {
		await Promise.withTimeout(1000 / period);
		if (!dialogLoader.open) continue;
		bSubtitle.innerText = `${subtitle}${`.`.repeat(counter)}`;
		counter = (counter + 1) % period;
	}
}();
const keyframeAppear: Keyframe = { opacity: `1` };
const keyframeDisappear: Keyframe = { opacity: `0` };
Window.prototype.load = async function <T>(promise: Promise<T>, duration: number = 200, delay: number = 0): Promise<T> {
	try {
		dialogLoader.showModal();
		await dialogLoader.animate([keyframeDisappear, keyframeAppear], { duration, fill: `both` }).finished;
		return await promise;
	} finally {
		await dialogLoader.animate([keyframeAppear, keyframeDisappear], { duration, fill: `both`, delay }).finished;
		dialogLoader.close();
	}
};
//#endregion
//#region Version manager
/**
 * Represents a version manager for parsing and comparing version numbers.
 */
class VersionManager {
	static #patternVersion: RegExp = /^(\d+)\.(\d+)\.(\d+)$/;
	/**
	 * Parses a version number from the given string.
	 * @param string The string representing the version number.
	 * @returns A VersionManager instance representing the parsed version.
	 * @throws {SyntaxError} If the version syntax is invalid.
	 */
	static parse(string: string): VersionManager {
		const match = VersionManager.#patternVersion.exec(string);
		if (match === null) throw new SyntaxError(`Invalid version '${string}' syntax. Version must have <number>.<number>.<number> syntax`);
		const [, major, minor, patch] = match.map(part => Number(part));
		const version = new VersionManager();
		version.#major = major;
		version.#minor = minor;
		version.#patch = patch;
		return version;
	}
	#major: number = 1;
	#minor: number = 0;
	#patch: number = 0;
	/**
	 * Checks if this version is higher than the specified version.
	 * @param other The other version to compare against.
	 * @returns True if this version is higher; otherwise, false.
	 */
	isHigherThen(other: VersionManager): boolean {
		if (this.#major > other.#major) return true;
		else if (this.#minor > other.#minor) return true;
		else if (this.#patch > other.#patch) return true;
		else return false;
	}
	/**
	 * Converts the version to a string representation.
	 */
	toString(): string {
		return `${this.#major}.${this.#minor}.${this.#patch}`;
	}
}
//#endregion
//#region Navigator
declare global {
	interface Navigator {
		/**
		 * Retrieves the data path based on developer and application name metadata.
		 * @returns The data path.
		 */
		readonly dataPath: string;
		/**
		 * Retrieves the version information from the metadata.
		 * @returns An instance representing the version.
		 */
		readonly version: VersionManager;
		/**
		 * А property to interact with the color scheme in webpage.
		 */
		colorScheme: string;
		/**
		 * Downloads the specified file.
		 * @param file The file to download.
		 */
		download(file: File): void;
	}
}

Object.defineProperty(Navigator.prototype, `dataPath`, {
	get(this: Navigator): string {
		const developer = document.getElement(HTMLMetaElement, `meta[name="author"]`).content;
		const title = document.getElement(HTMLMetaElement, `meta[name="title"]`).content;
		return `${developer}.${title}`;
	}
});

Object.defineProperty(Navigator.prototype, `version`, {
	get(this: Navigator): VersionManager {
		const metaVersion = document.getElement(HTMLMetaElement, `meta[name="generator"]`).content;
		return VersionManager.parse(metaVersion);
	}
});

Object.defineProperty(Navigator.prototype, `colorScheme`, {
	get(this: Navigator): string {
		return document.getElement(HTMLMetaElement, `meta[name="color-scheme"]`).content;
	},
	set(this: Navigator, value: string): void {
		document.getElement(HTMLMetaElement, `meta[name="color-scheme"]`).content = String(value);
	}
});

Navigator.prototype.download = function (file: File): void {
	const aLink = document.createElement(`a`);
	aLink.download = file.name;
	aLink.href = URL.createObjectURL(file);
	aLink.click();
	URL.revokeObjectURL(aLink.href);
	aLink.remove();
};
//#endregion
//#region Webpage controller
/**
 * Abstract base class for webpage controllers.
 * @abstract
 */
abstract class WebpageController extends Controller {
	static #IGNORE_ERRORS: string = "ignore";
	/**
	 * Returns the string literal for ignoring errors.
	 * @readonly
	 */
	static get IGNORE_ERRORS(): string {
		return this.#IGNORE_ERRORS;
	}

	static #LOG_ERRORS: string = "log";
	/**
	 * Returns the string literal for logging errors to the console.
	 * @readonly
	 */
	static get LOG_ERRORS(): string {
		return this.#LOG_ERRORS;
	}

	static #POP_UP_ERRORS: string = "pop-up";
	/**
	 * Returns the string literal for showing errors as popup alerts.
	 * @readonly
	 */
	static get POP_UP_ERRORS(): string {
		return this.#POP_UP_ERRORS;
	}

	static #log(error: Error): void {
		console.error(error);
	}

	static async #popup(error: Error): Promise<void> {
		await window.alertAsync(error.toString());
		location.reload();
	}

	/**
	 * @param handling The error handling strategy to use.
	 * @throws {TypeError} If instantiated directly instead of via subclass.
	 */
	constructor(handling: string = WebpageController.POP_UP_ERRORS) {
		super();
		if (new.target === WebpageController) throw new TypeError("Unable to create an instance of an abstract class");
		this.#handling = handling;
	}

	#handling: string;

	/**
	 * Handles an error according to the selected strategy.
	 * @param error The error to handle.
	 * @throws {TypeError} If an unknown strategy is provided.
	 */
	async catch(error: Error): Promise<void> {
		switch (this.#handling) {
			case WebpageController.IGNORE_ERRORS: return;
			case WebpageController.LOG_ERRORS: return WebpageController.#log(error);
			case WebpageController.POP_UP_ERRORS: return await WebpageController.#popup(error);
			default: throw new TypeError(`Invalid '${this.#handling}' error handling`);
		}
	}
}
//#endregion


export { WebpageController };
