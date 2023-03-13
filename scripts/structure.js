"use strict";
//#region Post
class Post {
	/**
	 * 
	 * @param {String} title 
	 * @param {Date} date 
	 * @param {String} content 
	 * @param  {String} tags 
	 */
	constructor(title, date, content, tags, snippets = false) {
		this.#title = title;
		this.#date = date;
		this.#content = content;
		this.#tags = tags.split(` `).filter((tag) => {
			if (tag == window.encodeURI(tag)) {
				return true;
			} else throw new SyntaxError(`Invalid tag: '${tag}'`);
		});
		this.#snippets = snippets;
	}
	/** @type {String} */ #title;
	/** @readonly */ get title() {
		return this.#title;
	}
	/** @type {Date} */ #date;
	/** @readonly */ get date() {
		return this.#date;
	}
	/** @type {String} */ #content;
	/** @readonly */ get content() {
		return this.#content;
	}
	/** @type {Array<String>} */ #tags;
	/** @readonly */ get tags() {
		return Object.freeze(this.#tags);
	}
	/** @type {Boolean} */ #snippets;
	/** @readonly */ get snippets() {
		return this.#snippets;
	}
}
//#endregion
//#region Preferences
/**
 * @typedef PreferencesNotation
 * @property {String | undefined} theme
 */
class Preferences {
	/**
	 * @param {PreferencesNotation} source 
	 */
	static import(source) {
		const result = new Preferences();
		if (source.theme !== undefined) result.#theme = source.theme;
		return result;
	}
	/**
	 * @param {Preferences} source 
	 */
	static export(source) {
		const result = (/** @type {PreferencesNotation} */ ({}));
		result.theme = source.#theme;
		return result;
	}
	/** @type {Array<String>} */ static #themes = [`system`, `light`, `dark`];
	/** @readonly */ static get themes() {
		return Object.freeze(this.#themes);
	}
	constructor() {
		this.#theme = Preferences.themes[0];
	}
	/** @type {String} */ #theme;
	get theme() {
		return this.#theme;
	}
	set theme(value) {
		if (Preferences.#themes.includes(value)) {
			this.#theme = value;
		} else {
			throw new TypeError(`Invalid theme type: '${value}'.`);
		}
	}
}
//#endregion
//#region Metadata
/** @type {Archive<PreferencesNotation>} */ const archivePreferences = new Archive(`${Application.developer}\\${Application.title}\\Preferences`, Preferences.export(new Preferences()));
//#endregion