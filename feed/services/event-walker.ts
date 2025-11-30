"use strict";

import "adaptive-extender/core";
import { ImplementationError } from "adaptive-extender/core";
import { type GitHubActivity } from "../models/user-activity.js";

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

	async *crawl(): AsyncIterable<GitHubActivity> {
		throw new ImplementationError();
	}
}
//#endregion
