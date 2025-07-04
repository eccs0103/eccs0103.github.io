"use strict";
import { Controller } from "../core/extensions.js";
import "../worker/extensions.js";
import { bSubtitle, dialogLoader } from "./loader.js";
import { buttonConfirmAccept, buttonConfirmDecline, buttonPromptAccept, dialogAlert, dialogConfirm, dialogPrompt, divAlertCoontainer, divConfirmContainer, divPromptContainer, inputPrompt } from "./popup.js";
Element.prototype.getElement = function (type, selectors) {
    const element = this.querySelector(selectors);
    if (element instanceof type)
        return element;
    else
        throw new TypeError(`Element ${selectors} is missing or has invalid type`);
};
Element.prototype.getElementAsync = function (type, selectors) {
    return Promise.resolve(this.getElement(type, selectors));
};
Element.prototype.getElements = function (type, selectors) {
    const elements = this.querySelectorAll(selectors);
    if (Array.from(elements).every(element => element instanceof type))
        return elements;
    else
        throw new TypeError(`Element ${selectors} is missing or has invalid type`);
};
Element.prototype.getElementsAsync = function (type, selectors) {
    return Promise.resolve(this.getElements(type, selectors));
};
Document.prototype.getElement = function (type, selectors) {
    return this.documentElement.getElement(type, selectors);
};
Document.prototype.getElementAsync = function (type, selectors) {
    return this.documentElement.getElementAsync(type, selectors);
};
Document.prototype.getElements = function (type, selectors) {
    return this.documentElement.getElements(type, selectors);
};
Document.prototype.getElementsAsync = function (type, selectors) {
    return this.documentElement.getElementsAsync(type, selectors);
};
DocumentFragment.prototype.getElement = function (type, selectors) {
    const element = this.querySelector(selectors);
    if (element instanceof type)
        return element;
    else
        throw new TypeError(`Element ${selectors} is missing or has invalid type`);
};
DocumentFragment.prototype.getElementAsync = function (type, selectors) {
    return Promise.resolve(this.getElement(type, selectors));
};
DocumentFragment.prototype.getElements = function (type, selectors) {
    const elements = this.querySelectorAll(selectors);
    if (Array.from(elements).every(element => element instanceof type))
        return elements;
    else
        throw new TypeError(`Element ${selectors} is missing or has invalid type`);
};
DocumentFragment.prototype.getElementsAsync = function (type, selectors) {
    return Promise.resolve(this.getElements(type, selectors));
};
Element.prototype.getClosest = function (type, selectors) {
    const element = this.closest(selectors);
    if (element instanceof type)
        return element;
    else
        throw new TypeError(`Element ${selectors} is missing or has invalid type`);
};
Element.prototype.getClosestAsync = function (type, selectors) {
    return Promise.resolve(this.getClosest(type, selectors));
};
Document.prototype.loadImage = async function (url) {
    const image = new Image();
    const promise = Promise.withSignal((signal, resolve, reject) => {
        image.addEventListener(`load`, (event) => resolve(undefined), { signal });
        image.addEventListener(`error`, (event) => reject(Error.from(event.error)), { signal });
    });
    image.src = url;
    await promise;
    return image;
};
Document.prototype.loadImages = async function (urls) {
    return await Promise.all(urls.map(url => this.loadImage(url)));
};
let isAlertComposed = false;
dialogAlert.addEventListener(`click`, (event) => {
    if (event.target !== dialogAlert)
        return;
    isAlertComposed = true;
    dialogAlert.close();
});
Window.prototype.alertAsync = async function (message = String.empty) {
    dialogAlert.showModal();
    divAlertCoontainer.innerText = String(message);
    try {
        return await Promise.withSignal((signal, resolve) => {
            dialogAlert.addEventListener(`close`, event => (isAlertComposed ? resolve() : null), { signal });
        });
    }
    finally {
        isAlertComposed = false;
        dialogAlert.close();
    }
};
let isConfirmComposed = false;
dialogConfirm.addEventListener(`click`, (event) => {
    if (event.target !== dialogConfirm)
        return;
    isConfirmComposed = true;
    dialogConfirm.close();
});
Window.prototype.confirmAsync = async function (message = String.empty) {
    dialogConfirm.showModal();
    divConfirmContainer.innerText = message;
    try {
        return await Promise.withSignal((signal, resolve) => {
            buttonConfirmAccept.addEventListener(`click`, event => resolve(true), { signal });
            buttonConfirmDecline.addEventListener(`click`, event => resolve(false), { signal });
            dialogConfirm.addEventListener(`close`, event => (isConfirmComposed ? resolve(false) : null), { signal });
        });
    }
    finally {
        isConfirmComposed = false;
        dialogConfirm.close();
    }
};
let isPromptComposed = false;
dialogPrompt.addEventListener(`click`, (event) => {
    if (event.target !== dialogPrompt)
        return;
    isPromptComposed = true;
    dialogPrompt.close();
});
Window.prototype.promptAsync = async function (message = String.empty, _default = String.empty) {
    dialogPrompt.showModal();
    divPromptContainer.innerText = message;
    inputPrompt.value = _default;
    try {
        return await Promise.withSignal((signal, resolve) => {
            buttonPromptAccept.addEventListener(`click`, event => resolve(inputPrompt.value), { signal });
            dialogPrompt.addEventListener(`close`, event => (isPromptComposed ? resolve(null) : null), { signal });
        });
    }
    finally {
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
        if (!dialogLoader.open)
            continue;
        bSubtitle.innerText = `${subtitle}${`.`.repeat(counter)}`;
        counter = (counter + 1) % period;
    }
}();
const keyframeAppear = { opacity: `1` };
const keyframeDisappear = { opacity: `0` };
Window.prototype.load = async function (promise, duration = 200, delay = 0) {
    try {
        dialogLoader.showModal();
        await dialogLoader.animate([keyframeDisappear, keyframeAppear], { duration, fill: `both` }).finished;
        return await promise;
    }
    finally {
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
    static #patternVersion = /^(\d+)\.(\d+)\.(\d+)$/;
    /**
     * Parses a version number from the given string.
     * @param string The string representing the version number.
     * @returns A VersionManager instance representing the parsed version.
     * @throws {SyntaxError} If the version syntax is invalid.
     */
    static parse(string) {
        const match = VersionManager.#patternVersion.exec(string);
        if (match === null)
            throw new SyntaxError(`Invalid version '${string}' syntax. Version must have <number>.<number>.<number> syntax`);
        const [, major, minor, patch] = match.map(part => Number(part));
        const version = new VersionManager();
        version.#major = major;
        version.#minor = minor;
        version.#patch = patch;
        return version;
    }
    #major = 1;
    #minor = 0;
    #patch = 0;
    /**
     * Checks if this version is higher than the specified version.
     * @param other The other version to compare against.
     * @returns True if this version is higher; otherwise, false.
     */
    isHigherThen(other) {
        if (this.#major > other.#major)
            return true;
        else if (this.#minor > other.#minor)
            return true;
        else if (this.#patch > other.#patch)
            return true;
        else
            return false;
    }
    /**
     * Converts the version to a string representation.
     */
    toString() {
        return `${this.#major}.${this.#minor}.${this.#patch}`;
    }
}
Object.defineProperty(Navigator.prototype, `dataPath`, {
    get() {
        const developer = document.getElement(HTMLMetaElement, `meta[name="author"]`).content;
        const title = document.getElement(HTMLMetaElement, `meta[name="title"]`).content;
        return `${developer}.${title}`;
    }
});
Object.defineProperty(Navigator.prototype, `version`, {
    get() {
        const metaVersion = document.getElement(HTMLMetaElement, `meta[name="generator"]`).content;
        return VersionManager.parse(metaVersion);
    }
});
Object.defineProperty(Navigator.prototype, `colorScheme`, {
    get() {
        return document.getElement(HTMLMetaElement, `meta[name="color-scheme"]`).content;
    },
    set(value) {
        document.getElement(HTMLMetaElement, `meta[name="color-scheme"]`).content = String(value);
    }
});
Navigator.prototype.download = function (file) {
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
class WebpageController extends Controller {
    static #IGNORE_ERRORS = "ignore";
    /**
     * Returns the string literal for ignoring errors.
     * @readonly
     */
    static get IGNORE_ERRORS() {
        return this.#IGNORE_ERRORS;
    }
    static #LOG_ERRORS = "log";
    /**
     * Returns the string literal for logging errors to the console.
     * @readonly
     */
    static get LOG_ERRORS() {
        return this.#LOG_ERRORS;
    }
    static #POP_UP_ERRORS = "pop-up";
    /**
     * Returns the string literal for showing errors as popup alerts.
     * @readonly
     */
    static get POP_UP_ERRORS() {
        return this.#POP_UP_ERRORS;
    }
    static #log(error) {
        console.error(error);
    }
    static async #popup(error) {
        await window.alertAsync(error.toString());
        location.reload();
    }
    /**
     * @param handling The error handling strategy to use.
     * @throws {TypeError} If instantiated directly instead of via subclass.
     */
    constructor(handling = WebpageController.POP_UP_ERRORS) {
        super();
        if (new.target === WebpageController)
            throw new TypeError("Unable to create an instance of an abstract class");
        this.#handling = handling;
    }
    #handling;
    /**
     * Handles an error according to the selected strategy.
     * @param error The error to handle.
     * @throws {TypeError} If an unknown strategy is provided.
     */
    async catch(error) {
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
