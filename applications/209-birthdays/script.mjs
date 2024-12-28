"use strict";

import { } from "../../scripts/dom/extensions.mjs";
import { ArchiveManager } from "../../scripts/dom/storage.mjs";
import { Random } from "../../scripts/core/generators.mjs";
import { Timespan } from "../../scripts/core/measures.mjs";

const { trunc } = Math;

//#region Group
/**
 * @typedef {object} MemberNotation
 * @property {string} name
 * @property {string} surname
 * @property {string} patronymic
 * @property {string} birthday
 */

/**
 * @typedef {object} GroupNotation
 * @property {string} name
 * @property {MemberNotation[]} members
 * @property {object[]} wishes
 * 
 */

/**
 * @typedef {InstanceType<typeof Group.Member>} GroupMember
 */

class Group {
	//#region Member
	static Member = class GroupMember {
		/**
		 * @param {any} source 
		 * @param {string} name 
		 * @returns {GroupMember}
		 */
		static import(source, name = `source`) {
			try {
				const shell = Object.import(source);
				const name2 = String.import(Reflect.get(shell, `name`), `property name`);
				const surname = String.import(Reflect.get(shell, `surname`), `property surname`);
				const patronymic = String.import(Reflect.get(shell, `patronymic`), `property patronymic`);
				const birthday = new Date(String.import(Reflect.get(shell, `birthday`), `property birthday`));
				return new GroupMember(name2, surname, patronymic, birthday);
			} catch (error) {
				throw new TypeError(`Unable to import ${(name)} due its ${typename(source)} type`, { cause: error });
			}
		}
		/**
		 * @param {string} name 
		 * @param {string} surname 
		 * @param {string} patronymic 
		 * @param {Date} birthday 
		 */
		constructor(name, surname, patronymic, birthday) {
			this.#name = name;
			this.#surname = surname;
			this.#patronymic = patronymic;
			this.#birthday = Number(birthday);
			this.#wishes = new Map();
			this.#importance = new Map();
		}
		/** @type {string} */
		#name;
		/**
		 * @readonly
		 * @returns {string}
		 */
		get name() {
			return this.#name;
		}
		/** @type {string} */
		#surname;
		/**
		 * @readonly
		 * @returns {string}
		 */
		get surname() {
			return this.#surname;
		}
		/** @type {string} */
		#patronymic;
		/**
		 * @readonly
		 * @returns {string}
		 */
		get patronymic() {
			return this.#patronymic;
		}
		/** @type {number} */
		#birthday;
		/**
		 * @readonly
		 * @returns {Date}
		 */
		get birthday() {
			return new Date(this.#birthday);
		}
		/** @type {Map<GroupMember, string>} */
		#wishes;
		/**
		 * @param {GroupMember} addressee 
		 * @param {string} content 
		 * @returns {void}
		 */
		toWish(addressee, content) {
			addressee.#wishes.set(this, content);
		}
		/** @type {Map<GroupMember, number>} */
		#importance;
		/**
		 * @param {GroupMember} addressee 
		 * @param {number} importance 
		 * @returns {void}
		 */
		setImportanceFrom(addressee, importance) {
			if (!this.#wishes.has(addressee)) throw new ReferenceError(`Unable to set importance for the non-existing wish`);
			this.#importance.set(addressee, importance);
		}
		/**
		 * @readonly
		 * @returns {string?}
		 */
		askWish() {
			const importance = this.#importance;
			if (importance.size === 0) return null;
			const random = Random.global;
			const addressee = random.case(importance);
			return this.#wishes.get(addressee) ?? Error.throws(`Unable to ask for the non-existing wish`);
		}
	};
	//#endregion

	/**
	 * @param {any} source 
	 * @param {string} name 
	 * @returns {Group}
	 */
	static import(source, name = `source`) {
		try {
			const shell = Object.import(source);
			const group = new Group(`209`);
			const identifiers = group.#identifiers;
			const members = group.#members;
			Array.import(Reflect.get(shell, `members`), `property members`).forEach((row, index) => {
				const identifier = Number.import(Reflect.get(row, `identifier`), `property members[${(index)}] identifier`);
				const member = Group.Member.import(row, `property members[${(index)}]`);
				identifiers.set(identifier, member);
				members.set(member, identifier);
			});
			Array.import(Reflect.get(shell, `wishes`), `property wishes`).forEach((row, index) => {
				const identifier1 = Number.import(Reflect.get(row, `member`), `property wishes[${(index)}] identifier`);
				const identifier2 = Number.import(Reflect.get(row, `addressee`), `property wishes[${(index)}] addressee`);
				const content = String.import(Reflect.get(row, `content`), `property wishes[${(index)}] content`);
				const importance = Number.import(Reflect.get(row, `importance`), `property wishes[${(index)}] importance`);
				const member = identifiers.get(identifier1) ?? Error.throws(`Member with identifier '${identifier1}' not registered in this group`);
				const addressee = identifiers.get(identifier2) ?? Error.throws(`Member with identifier '${identifier2}' not registered in this group`);
				member.toWish(addressee, content);
				addressee.setImportanceFrom(member, importance);
			});
			return group;
		} catch (error) {
			throw new TypeError(`Unable to import ${(name)} due its ${typename(source)} type`, { cause: error });
		}
	}
	/**
	 * @param {string} name 
	 */
	constructor(name) {
		this.#name = name;
		this.#identifiers = new Map();
		this.#members = new Map();
	}
	/** @type {string} */
	#name;
	/**
	 * @readonly
	 * @returns {string}
	 */
	get name() {
		return this.#name;
	}
	/** @type {Map<number, GroupMember>} */
	#identifiers;
	/** @type {Map<GroupMember, number>} */
	#members;
	/**
	 * @readonly
	 * @returns {GroupMember[]}
	 */
	get members() {
		return Array.from(this.#members.keys());
	}
	/**
	 * @param {string} name 
	 * @param {string} surname 
	 * @param {string} patronymic 
	 * @param {Date} birthday 
	 * @returns {GroupMember}
	 */
	register(name, surname, patronymic, birthday) {
		const identifiers = this.#identifiers;
		const members = this.#members;
		const identifier = identifiers.size;
		const member = new Group.Member(name, surname, patronymic, birthday);
		identifiers.set(identifier, member);
		members.set(member, identifier);
		return member;
	}
}
//#endregion

//#region Settings
/**
 * @typedef {object} SettingsNotation
 * @property {number} selection
 */

class Settings {
	/**
	 * @param {any} source 
	 * @param {string} name 
	 * @returns {Settings}
	 */
	static import(source, name = `source`) {
		try {
			const shell = Object.import(source);
			const selection = Reflect.get(shell, `selection`);
			const settings = new Settings();
			if (selection !== undefined) {
				settings.selection = Number.import(selection, `property selection`);
			}
			return settings;
		} catch (error) {
			throw new TypeError(`Unable to import ${(name)} due its ${typename(source)} type`, { cause: error });
		}
	}
	/**
	 * @returns {SettingsNotation}
	 */
	export() {
		return {
			selection: this.selection,
		};
	}
	/** @type {number} */
	#selection = 0;
	/**
	 * @returns {number}
	 */
	get selection() {
		return this.#selection;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set selection(value) {
		this.#selection = value;
	}
}
//#endregion

//#region Timer
/**
 * @typedef {object} TimerEventMap
 * @property {Event} update
 */

class Timer extends EventTarget {
	constructor(multiple = false) {
		super();

		this.#multiple = multiple;
		setInterval(this.#update.bind(this));
	}
	/**
	 * @template {keyof TimerEventMap} K
	 * @overload
	 * @param {K} type 
	 * @param {(this: Timer, ev: TimerEventMap[K]) => any} listener 
	 * @param {boolean | AddEventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | AddEventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | AddEventListenerOptions} options 
	 * @returns {void}
	 */
	addEventListener(type, listener, options = false) {
		return super.addEventListener(type, listener, options);
	}
	/**
	 * @template {keyof TimerEventMap} K
	 * @overload
	 * @param {K} type 
	 * @param {(this: Timer, ev: TimerEventMap[K]) => any} listener 
	 * @param {boolean | EventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | EventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | EventListenerOptions} options 
	 * @returns {void}
	 */
	removeEventListener(type, listener, options = false) {
		return super.removeEventListener(type, listener, options);
	}
	/** @type {boolean} */
	#multiple;
	/** @type {number} */
	#counter = 0;
	/**
	 * @returns {number}
	 */
	get counter() {
		return this.#counter;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set counter(value) {
		this.#counter = value;
	}
	/** @type {number} */
	#previous = performance.now();
	/**
	 * @returns {void}
	 */
	#update() {
		if (!this.#multiple && this.#counter === 0) return;
		const current = performance.now();
		const difference = current - this.#previous;
		this.#counter -= difference;
		if (this.#counter <= 0) {
			this.#counter = 0;
			if (!this.dispatchEvent(new Event(`update`))) return;
		}
		this.#previous = current;
	}
}
//#endregion

//#region Alert severity
/**
 * @enum {number}
 */
const AlertSeverity = {
	/**
	 * Ignore the response, taking no action.
	 * @readonly
	 */
	ignore: 0,
	/**
	 * Log the response for informational purposes.
	 * @readonly
	 */
	log: 1,
	/**
	 * Throw an error in response to a critical event.
	 * @readonly
	 */
	throw: 2,
};
Object.freeze(AlertSeverity);
//#endregion
//#region Controller
/**
 * Represents the controller for the application.
 */
class Controller {
	//#region Internal
	/** @type {boolean} */
	static #locked = true;
	/**
	 * Starts the main application flow.
	 * @returns {Promise<void>}
	 */
	static async build() {
		Controller.#locked = false;
		const self = new Controller();
		Controller.#locked = true;

		try {
			await self.#main();
		} catch (reason) {
			await self.#catch(Error.from(reason));
		}
	}
	constructor() {
		if (Controller.#locked) throw new TypeError(`Illegal constructor`);
	}
	/** @type {AlertSeverity} */
	#severity = AlertSeverity.throw;
	/**
	 * @param {Error} error 
	 * @returns {Promise<void>}
	 */
	async #catch(error) {
		switch (this.#severity) {
			case AlertSeverity.ignore: break;
			case AlertSeverity.log: {
				console.error(error);
			} break;
			case AlertSeverity.throw: {
				await window.alertAsync(error);
				location.reload();
			} break;
		}
	}
	//#endregion
	//#region Implementation
	//#region Model
	/**
	 * @returns {Promise<void>}
	 */
	async #buildModel() {
		const response = await fetch(`./database-2025.json`);
		const object = await response.json();
		const group = Group.import(object);
		const members = this.#members = group.members
			.sort((member1, member2) => member1.birthday.getDate() - member2.birthday.getDate())
			.sort((member1, member2) => member1.birthday.getMonth() - member2.birthday.getMonth());

		const settings = this.#settings = (await ArchiveManager.construct(`${navigator.dataPath}.Settings`, Settings)).content;

		this.#memberSelection = members.at(settings.selection) ?? null;
	}
	/** @type {GroupMember[]} */
	#members;
	/** @type {Settings} */
	#settings;
	/** @type {GroupMember?} */
	#memberSelection;
	/**
	 * @returns {void}
	 */
	#savePickerSelection() {
		const memberSelection = this.#memberSelection;
		if (memberSelection === null) return;
		const members = this.#members;
		const index = members.indexOf(memberSelection);
		const settings = this.#settings;
		if (index > 0) {
			settings.selection = index;
		}
	}
	//#endregion
	//#region View
	/**
	 * @param {GroupMember} member 
	 * @returns {HTMLButtonElement}
	 */
	static #createPickerItem(member) {
		const buttonPickerItem = document.createElement(`button`);
		buttonPickerItem.type = `button`;
		buttonPickerItem.title = String.empty;
		buttonPickerItem.classList.add(`picker-item`, `flex`, `column`, `primary-centered`);

		const spanItemTitle = buttonPickerItem.appendChild(document.createElement(`span`));
		spanItemTitle.classList.add(`title`);
		spanItemTitle.textContent = `${member.birthday.toLocaleDateString(`hy`, { month: `short`, day: `numeric` })}`;

		const spanItemSubtitle = buttonPickerItem.appendChild(document.createElement(`dfn`));
		spanItemSubtitle.classList.add(`subtitle`);
		spanItemSubtitle.textContent = `${member.name}`;

		return buttonPickerItem;
	}
	/**
	 * @returns {Promise<void>}
	 */
	async #buildView() {
		const members = this.#members;

		const divScrollPicker = this.#divScrollPicker = document.getElement(HTMLDivElement, `div#scroll-picker`);
		const pairMemberWithButton = this.#pairMemberWithButton = members.map(member => [member, divScrollPicker.appendChild(Controller.#createPickerItem(member))]);

		const h4SelectionTitle = this.#h4SelectionTitle = document.getElement(HTMLHeadingElement, `h4#selection-title`);

		const timer = this.#timer = new Timer(false);
	}
	/** @type {HTMLDivElement} */
	#divScrollPicker;
	/** @type {[GroupMember, HTMLButtonElement][]} */
	#pairMemberWithButton;
	/**
	 * @returns {[GroupMember, HTMLButtonElement]?}
	 */
	#findSavedSelection() {
		const pairMemberWithButton = this.#pairMemberWithButton;
		const settings = this.#settings;
		return pairMemberWithButton.at(settings.selection) ?? null;
	}
	/**
	 * @returns {[GroupMember, HTMLButtonElement]?}
	 */
	#findPickerClosest() {
		const divScrollPicker = this.#divScrollPicker;
		const pairMemberWithButton = this.#pairMemberWithButton;

		const { y, height } = divScrollPicker.getBoundingClientRect();
		const center = y + height / 2;
		return pairMemberWithButton.find(([, buttonPickerItem]) => {
			const { y, height } = buttonPickerItem.getBoundingClientRect();
			return (y <= center && center < y + height);
		}) ?? null;
	}
	/** @type {HTMLButtonElement?} */
	#buttonPickerSelection = null;
	/**
	 * @param {[GroupMember, HTMLButtonElement]?} pair 
	 * @returns {void}
	 */
	#setPickerSelection(pair) {
		if (this.#buttonPickerSelection !== null) this.#buttonPickerSelection.classList.remove(`selected`);
		const [member, button] = pair ?? [null, null];
		this.#buttonPickerSelection = button;
		if (this.#buttonPickerSelection !== null) this.#buttonPickerSelection.classList.add(`selected`);
		this.#memberSelection = member;
	}
	/** @type {HTMLHeadingElement} */
	#h4SelectionTitle;
	/**
	 * @param {string} easing 
	 * @param {string} opacity 
	 * @returns {Keyframe}
	 */
	#createAppearanceKeyframe(opacity, easing) {
		return { opacity, easing };
	}
	/**
	 * @param {string} text 
	 * @param {boolean} animate 
	 * @returns {Promise<void>}
	 */
	async #writeSelectionTitle(text, animate) {
		const h4SelectionTitle = this.#h4SelectionTitle;
		const disappearance = this.#createAppearanceKeyframe(`0`, `ease-in`);
		const appearance = this.#createAppearanceKeyframe(`1`, `ease-out`);
		const duration = 500, fill = `both`;
		if (animate) await h4SelectionTitle.animate([appearance, disappearance], { duration, fill }).finished;
		h4SelectionTitle.textContent = text;
		if (animate) await h4SelectionTitle.animate([disappearance, appearance], { duration, fill }).finished;
	}
	/** @type {Timer} */
	#timer;
	/**
	 * @param {string} text 
	 * @param {boolean} animate 
	 * @param {number} counter 
	 * @returns {void}
	 */
	#provideContainerLifecycle(text, animate, counter = 0) {
		const timer = this.#timer;
		this.#writeSelectionTitle(text, animate);
		timer.counter = counter;
	}
	/**
	 * @param {boolean} animate
	 * @returns {void}
	 */
	#updatePickerContainer(animate) {
		const memberSelection = this.#memberSelection;

		if (memberSelection === null) return this.#provideContainerLifecycle(String.empty, false);

		const date = new Date();
		date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
		const now = Number(date);
		const { birthday } = memberSelection;
		const begin = birthday.setFullYear(date.getFullYear());
		const end = birthday.setDate(birthday.getDate() + 1);
		const wish = memberSelection.askWish();

		if (wish !== null) {
			return this.#provideContainerLifecycle(wish, animate, 5000);
		}

		const timespan = Timespan.viaDuration(begin - now);
		const days = trunc(timespan.hours / 24);
		const hours = timespan.hours % 24;
		const { negativity, minutes, seconds } = timespan;
		return this.#provideContainerLifecycle(`${negativity ? `Անցավ` : `Մնաց`} ${days}օր ${hours}ժ․ ${minutes}ր․ ${seconds}վ․`, false, 1000);
	}
	/**
	 * @returns {void}
	 */
	#updatePickerChange() {
		const buttonPickerSelection = this.#buttonPickerSelection;
		if (buttonPickerSelection === null) return;
		buttonPickerSelection.scrollIntoView({ behavior: `smooth`, block: `center` });

		this.#savePickerSelection();
		this.#updatePickerContainer(false);
	}
	/**
	 * @returns {Promise<void>}
	 */
	async #runViewInitialization() {
		const divScrollPicker = this.#divScrollPicker;
		const pairMemberWithButton = this.#pairMemberWithButton;
		const timer = this.#timer;

		await Promise.withTimeout(1000);
		this.#setPickerSelection(this.#findSavedSelection());
		this.#updatePickerChange();

		divScrollPicker.addEventListener(`scroll`, event => this.#setPickerSelection(this.#findPickerClosest()));
		divScrollPicker.addEventListener(`scrollend`, event => this.#updatePickerChange());

		window.addEventListener(`resize`, (event) => {
			this.#setPickerSelection(this.#findPickerClosest());
			this.#updatePickerChange();
		});

		for (const [member, buttonPickerItem] of pairMemberWithButton) {
			buttonPickerItem.addEventListener(`click`, (event) => {
				this.#setPickerSelection([member, buttonPickerItem]);
				this.#updatePickerChange();
			});
		}

		timer.addEventListener(`update`, event => this.#updatePickerContainer(true));
	}
	//#endregion

	/**
	 * @returns {Promise<void>}
	 */
	async #main() {
		await this.#buildModel();

		await this.#buildView();
		await this.#runViewInitialization();
	}
	//#endregion
}
//#endregion

Controller.build();
