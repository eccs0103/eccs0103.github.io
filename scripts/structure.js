//#region Post
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
//#endregion
//#region MyMarkdownElement
class MyMarkdownElement extends HTMLDivElement {
	constructor() {
		super();
		new MutationObserver((mutations, observer) => {
			observer.disconnect();
			const modifiers = (/** @type {Map<RegExp, (substring: String) => String>} */ (new Map([
				[/(?<!\!)\[(.*)\]\((.*)\)/gim, substring => {
					const description = substring.substring(1, substring.search(/\]/));
					const link = substring.substring(3 + description.length, substring.length - 1);
					return `<a href="${link}">${description}</a>`;
				}],
				[/!\[(.*)\]\((.*)\)/gim, substring => {
					const description = substring.substring(2, substring.search(/\]/));
					const link = substring.substring(4 + description.length, substring.length - 1);
					return `<img src="${link}" alt="${description}"/>`;
				}],
				[/```([\s\S]*)```/gim, substring => {
					return `<code class="depth">${substring.substring(3, substring.length - 3).trim().split(`\n`).map((line) => `<span>${line}</span>`).join(`\n`)}</code>`;
				}],
				[/  \n/gim, substring => `</br>`],
				[/ {2,}/gim, substring => ` `],
			])));
			this.innerHTML = (Array.from(modifiers).reduce((content, modifier) => content.replace(modifier[0], substring => modifier[1](substring)), this.innerHTML));
			observer.observe(this, { childList: true, subtree: true });
		}).observe(this, { childList: true, subtree: true });
	}
}
customElements.define(`my-markdown`, MyMarkdownElement, { extends: `div` });
//#endregion
//#region Metadata
const safeMode = true;
//#endregion