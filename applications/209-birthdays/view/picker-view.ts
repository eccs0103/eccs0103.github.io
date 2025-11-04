"use strict";

import { Timer } from "../../../timer.js";
import { type GroupMember } from "../models/group.js";

//#region Picker view
interface PickerEventMap {
	"selectionchange": CustomEvent<GroupMember | null>;
	"selectioncommit": Event;
	"timertrigger": Event;
}

class PickerView extends EventTarget {
	#divScrollPicker: HTMLDivElement;
	#h4SelectionTitle: HTMLHeadingElement;
	#dfnSelectionAuxiliary: HTMLElement;
	#timer: Timer;

	#pairMemberWithButton: [GroupMember, HTMLButtonElement][] = [];
	#buttonPickerSelection: HTMLButtonElement | null = null;

	static #appearance: Keyframe = PickerView.#createAppearanceKeyframe("1", "ease-out");
	static #disappearance: Keyframe = PickerView.#createAppearanceKeyframe("0", "ease-in");
	static #duration: number = 500;
	static #fill: FillMode = "both";

	constructor() {
		super();

		this.#divScrollPicker = document.getElement(HTMLDivElement, "div#scroll-picker");
		this.#h4SelectionTitle = document.getElement(HTMLHeadingElement, "h4#selection-title");
		this.#dfnSelectionAuxiliary = document.getElement(HTMLElement, "dfn#selection-auxiliary");
		this.#timer = new Timer({ multiple: false });
	}

	addEventListener<K extends keyof PickerEventMap>(type: K, listener: (this: Timer, ev: PickerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | AddEventListenerOptions = false): void {
		return super.addEventListener(type, listener, options);
	}

	removeEventListener<K extends keyof PickerEventMap>(type: K, listener: (this: Timer, ev: PickerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options: boolean | EventListenerOptions = false): void {
		return super.removeEventListener(type, listener, options);
	}

	static #createAppearanceKeyframe(opacity: string, easing: string): Keyframe {
		return { opacity, easing };
	}

	static #createPickerItem(member: GroupMember): HTMLButtonElement {
		const buttonPickerItem = document.createElement("button");
		buttonPickerItem.type = "button";
		buttonPickerItem.title = String.empty;
		buttonPickerItem.classList.add("picker-item", "flex", "column", "primary-centered");

		const spanItemTitle = buttonPickerItem.appendChild(document.createElement("span"));
		spanItemTitle.classList.add("title");
		spanItemTitle.textContent = `${member.birthday.toLocaleDateString("hy", { month: "short", day: "numeric" })}`;

		const spanItemSubtitle = buttonPickerItem.appendChild(document.createElement("dfn"));
		spanItemSubtitle.classList.add("subtitle");
		spanItemSubtitle.textContent = `${member.name}`;

		return buttonPickerItem;
	}

	buildPickerItems(members: GroupMember[]): void {
		const divScrollPicker = this.#divScrollPicker;
		this.#pairMemberWithButton = members.map(member => [member, divScrollPicker.appendChild(PickerView.#createPickerItem(member))]);
	}

	#findPickerClosest(): [GroupMember, HTMLButtonElement] | null {
		const divScrollPicker = this.#divScrollPicker;
		const pairMemberWithButton = this.#pairMemberWithButton;

		const { y, height } = divScrollPicker.getBoundingClientRect();
		const center = y + height / 2;
		return pairMemberWithButton.find(([, buttonPickerItem]) => {
			const { y, height } = buttonPickerItem.getBoundingClientRect();
			return (y <= center && center < y + height);
		}) ?? null;
	}

	/**
	 * НОВЫЙ МЕТОД (Заменяет 'findSavedSelection'):
	 * Контроллер приказывает Отображению выделиться.
	 */
	setInitialSelection(selectionIndex: number): void {
		const pair = this.#pairMemberWithButton.at(selectionIndex) ?? this.#findPickerClosest();
		this.#highlightSelection(pair);
		// При инициализации прокручиваем без анимации
		this.#scrollToSelection(false);
	}

	/**
	 * НОВЫЙ МЕТОД (SRP):
	 * Только управляет DOM-выделением.
	 */
	#highlightSelection(pair: [GroupMember, HTMLButtonElement] | null): void {
		if (this.#buttonPickerSelection !== null) this.#buttonPickerSelection.classList.remove("selected");
		const [, button] = pair ?? [, null];
		this.#buttonPickerSelection = button;
		if (this.#buttonPickerSelection !== null) this.#buttonPickerSelection.classList.add("selected");
	}

	/**
	 * ИЗМЕНЕНО: Теперь вызывает #highlightSelection
	 * и отправляет событие.
	 */
	#setPickerSelection(pair: [GroupMember, HTMLButtonElement] | null): void {
		this.#highlightSelection(pair);
		// Отправляем 'member' (или 'null') в Контроллер
		const [member] = pair ?? [null, null];
		const a = new CustomEvent<GroupMember | null>("selectionchange", { detail: member });
		a.detail
		this.dispatchEvent(new CustomEvent("selectionchange", { detail: { member } }));
	}

	async #writeSelectionTitle(text: string, animate: boolean): Promise<void> {
		const h4SelectionTitle = this.#h4SelectionTitle;
		const disappearance = PickerView.#disappearance;
		const appearance = PickerView.#appearance;
		const duration = PickerView.#duration;
		const fill = PickerView.#fill;
		if (animate) await h4SelectionTitle.animate([appearance, disappearance], { duration, fill }).finished;
		h4SelectionTitle.textContent = text;
		if (animate) await h4SelectionTitle.animate([disappearance, appearance], { duration, fill }).finished;
	}

	async #writeSelectionAuxiliary(text: string, animate: boolean): Promise<void> {
		const dfnSelectionAuxiliary = this.#dfnSelectionAuxiliary;
		const disappearance = PickerView.#disappearance;
		const appearance = PickerView.#appearance;
		const duration = PickerView.#duration;
		const fill = PickerView.#fill;
		if (animate) await dfnSelectionAuxiliary.animate([appearance, disappearance], { duration, fill }).finished;
		dfnSelectionAuxiliary.textContent = text;
		if (animate) await dfnSelectionAuxiliary.animate([disappearance, appearance], { duration, fill }).finished;
	}

	updateContent(text: string, author: string, animate: boolean, counter: number = 0): void {
		this.#writeSelectionTitle(text, animate);
		this.#writeSelectionAuxiliary(author, animate);
		this.#timer.setTimeout(counter);
	}

	/**
	 * НОВЫЙ МЕТОД (SRP):
	 * Только прокручивает элемент в центр.
	 */
	#scrollToSelection(smooth: boolean): void {
		const buttonPickerSelection = this.#buttonPickerSelection;
		if (buttonPickerSelection === null) return;
		buttonPickerSelection.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
	}

	/**
	 * ИЗМЕНЕНО: Обработчик 'scrollend'.
	 * Раньше назывался #updatePickerChange (плохое имя).
	 */
	#onScrollEnd(): void {
		this.#scrollToSelection(true); // Плавно доводим до центра
		this.dispatchEvent(new Event("selectioncommit")); // Говорим Контроллеру сохранить
	}

	/**
	 * НОВЫЙ МЕТОД: Обработчик клика.
	 */
	#onClick(pair: [GroupMember, HTMLButtonElement]): void {
		this.#setPickerSelection(pair);
		this.#scrollToSelection(true);
		this.dispatchEvent(new Event("selectioncommit"));
	}

	/**
	 * ИЗМЕНЕНО: Больше не управляет логикой
	 * инициализации. Только 'вешает' слушателей.
	 */
	initializeListeners(): void {
		const divScrollPicker = this.#divScrollPicker;
		const pairMemberWithButton = this.#pairMemberWithButton;
		const timer = this.#timer;

		// УДАЛЕНО: Задержка и событие 'initializelayout'
		// этим теперь управляет Контроллер.

		divScrollPicker.addEventListener("scroll", event => this.#setPickerSelection(this.#findPickerClosest()));
		divScrollPicker.addEventListener("scrollend", this.#onScrollEnd.bind(this));

		window.addEventListener("resize", (event) => {
			// При ресайзе просто выделяем ближайший и доводим
			this.#setPickerSelection(this.#findPickerClosest());
			this.#onScrollEnd();
		});

		for (const pair of pairMemberWithButton) {
			const [, buttonPickerItem] = pair;
			buttonPickerItem.addEventListener("click", () => this.#onClick(pair));
		}

		timer.addEventListener("trigger", event => this.dispatchEvent(new Event("timertrigger")));
	}
}
//#endregion

export { PickerView };