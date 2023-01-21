class Post {
	/**
	 * 
	 * @param {String} title 
	 * @param {Date} date 
	 * @param {String} content 
	 * @param  {String} tags 
	 */
	constructor(title, date, content, tags) {
		this.#title = title;
		this.#date = date;
		this.#content = content;
		this.#tags = tags.split(` `);
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
}