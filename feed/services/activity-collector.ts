"use strict";

import "adaptive-extender/web";
import { Timespan } from "adaptive-extender/web";
import { Activity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";

//#region Activity collector
export type TypeOf<T> = abstract new (...args: any[]) => T;

export class ActivityCollector {
	#roots: Set<TypeOf<Activity>> = new Set();
	#gap: Readonly<Timespan>;

	constructor(gap: Readonly<Timespan>) {
		this.#gap = gap;
	}

	register<T extends Activity>(root: TypeOf<T>): void {
		this.#roots.add(root);
	}

	#isSameGroup(current: Activity, next: Activity, root: TypeOf<Activity>): boolean {
		if (!(next instanceof root)) return false;
		const difference = Timespan.fromValue(current.timestamp.valueOf() - next.timestamp.valueOf());
		return difference.valueOf() <= this.#gap.valueOf();
	}

	findRoot<T extends Activity>(target: T): TypeOf<T> | null {
		for (const root of this.#roots) {
			if (!(target instanceof root)) continue;
			return root as TypeOf<T>;
		}
		return null;
	}

	findGroup(cursor: ArrayCursor<Activity>, root: TypeOf<Activity>): Activity[] {
		const buffer: Activity[] = [];
		if (root === null) return buffer;
		let current = cursor.current;
		buffer.push(current);
		cursor.index++;
		while (cursor.inRange) {
			const next = cursor.current;
			if (!this.#isSameGroup(current, next, root)) break;
			buffer.push(next);
			current = next;
			cursor.index++;
		}
		return buffer;
	}
}
//#endregion
