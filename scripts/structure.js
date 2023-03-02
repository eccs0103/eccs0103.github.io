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