"use strict";

import "adaptive-extender/node";
import { ImplementationError } from "adaptive-extender/node";
import type { UserActivity } from "../models/user-activity.js";

//#region Event walker
/**
 * @abstract
 */
export class EventWalker {
	#name: string;

	constructor(name: string) {
		if (new.target === EventWalker) throw new TypeError("Unable to create an instance of an abstract class");
		this.#name = name;
	}

	get name(): string {
		return this.#name;
	}

	async *crawl(): AsyncIterable<UserActivity> {
		throw new ImplementationError();
	}
}
//#endregion
