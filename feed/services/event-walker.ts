"use strict";

import "adaptive-extender/web";
import { ImplementationError } from "adaptive-extender/web";
import type { UserActivity } from "../models/user-activity.js";

//#region Event walker
/**
 * @abstract
 */
class EventWalker<T> {
	constructor() {
		if (new.target === EventWalker) throw new TypeError("Unable to create an instance of an abstract class");
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
