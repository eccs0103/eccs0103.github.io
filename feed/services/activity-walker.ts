"use strict";

import "adaptive-extender/core";
import { ImplementationError } from "adaptive-extender/core";
import { Activity } from "../models/activity.js";

//#region Activity walker
export class ActivityWalker {
	#name: string;

	constructor(name: string) {
		if (new.target === ActivityWalker) throw new TypeError("Unable to create an instance of an abstract class");
		this.#name = name;
	}

	get name(): string {
		return this.#name;
	}

	async *crawl(): AsyncIterable<Activity> {
		throw new ImplementationError();
	}
}
//#endregion
