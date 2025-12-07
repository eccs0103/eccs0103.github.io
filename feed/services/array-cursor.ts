"use strict";

import "adaptive-extender/core";

//#region Array cursor
export class ArrayCursor<T> {
	#items: readonly T[];
	#index: number;

	constructor(items: readonly T[]) {
		this.#items = items;
		this.#index = 0;
	}

	get current(): T {
		return this.#items[this.#index];
	}

	get length(): number {
		return this.#items.length;
	}

	get inRange(): boolean {
		const index = this.#index;
		return 0 <= index && index < this.length;
	}

	advance(): void {
		this.#index++;
	}

	retreat(): void {
		this.#index--;
	}
}
//#endregion
