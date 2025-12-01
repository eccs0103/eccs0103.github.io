"use strict";

import "adaptive-extender/core";

//#region Array cursor
export class ArrayCursor<I, T extends I = I> {
	#items: readonly I[];
	#index: number;

	constructor(items: readonly I[]) {
		this.#items = items;
		this.#index = 0;
	}

	get target(): T {
		return this.#items[this.#index] as T;
	}

	get length(): number {
		return this.#items.length;
	}

	get inRange(): boolean {
		const index = this.#index;
		return 0 <= index && index < this.#items.length;
	}

	get index(): number {
		return this.#index;
	}

	set index(value: number) {
		this.#index = value;
	}
}
//#endregion
