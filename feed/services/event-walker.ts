"use strict";

import "adaptive-extender/node";
import { ImplementationError } from "adaptive-extender/node";
import type { UserActivity } from "../models/user-activity.js";

//#region Event walker
/**
 * @abstract
 */
class EventWalker<T = any> {
	#name: string;

	constructor(name: string) {
		if (new.target === EventWalker) throw new TypeError("Unable to create an instance of an abstract class");
		this.#name = name;
	}

	get name(): string {
		return this.#name;
	}

	async readEvents(): Promise<Iterable<T>> {
		throw new ImplementationError();
	}

	async castToActivity(event: T): Promise<UserActivity | null> {
		throw new ImplementationError();
	}
}
//#endregion

export { EventWalker };
