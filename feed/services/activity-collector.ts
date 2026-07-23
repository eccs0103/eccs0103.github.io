"use strict";

import "adaptive-extender/web";
import { Timespan } from "adaptive-extender/web";
import { Activity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";

//#region Activity collector
export type TypeOf<T> = abstract new (...args: any[]) => T;

export interface GroupingOptions {
	gap: Timespan;
	passThrough: boolean;
}

export class ActivityCollector {
	#source: readonly Activity[];
	#roots: Map<TypeOf<Activity>, GroupingOptions> = new Map();
	#consumed: WeakSet<Activity> = new WeakSet();

	constructor(source: readonly Activity[]) {
		this.#source = source;
	}

	register<T extends Activity>(root: TypeOf<T>): void;
	register<T extends Activity>(root: TypeOf<T>, options: Partial<GroupingOptions>): void;
	register<T extends Activity>(root: TypeOf<T>, options: Partial<GroupingOptions> = {}): void {
		const gap = options.gap ?? Timespan.fromComponents(36, 0, 0);
		const passThrough = options.passThrough ?? false;
		this.#roots.set(root, { gap, passThrough });
	}

	isConsumed(activity: Activity): boolean {
		return this.#consumed.has(activity);
	}

	#isSameGroup(current: Activity, next: Activity, root: TypeOf<Activity>, gap: Timespan): boolean {
		if (!(next instanceof root)) return false;
		const difference = Timespan.fromValue(current.timestamp.valueOf() - next.timestamp.valueOf());
		return difference.valueOf() <= gap.valueOf();
	}

	findRoot<T extends Activity>(target: T): TypeOf<T> | null {
		for (const [root] of this.#roots) {
			if (!(target instanceof root)) continue;
			return root as TypeOf<T>;
		}
		return null;
	}

	#findGroupConsecutive(cursor: ArrayCursor<Activity>, root: TypeOf<Activity>, gap: Timespan): Activity[] {
		const buffer: Activity[] = [];
		let { current } = cursor;
		buffer.push(current);
		cursor.index++;
		while (cursor.inRange) {
			const next = cursor.current;
			if (!this.#isSameGroup(current, next, root, gap)) break;
			buffer.push(next);
			current = next;
			cursor.index++;
		}
		return buffer;
	}

	#findGroupPassThrough(cursor: ArrayCursor<Activity>, root: TypeOf<Activity>, gap: Timespan): Activity[] {
		const source = this.#source;
		const consumed = this.#consumed;
		const buffer: Activity[] = [];
		const anchor = cursor.current;
		buffer.push(anchor);
		consumed.add(anchor);
		cursor.index++;

		let last = anchor;
		for (let index = cursor.index; index < source.length; index++) {
			const candidate = source[index];
			if (consumed.has(candidate)) continue;
			if (!(candidate instanceof root)) continue;
			const difference = Timespan.fromValue(last.timestamp.valueOf() - candidate.timestamp.valueOf());
			if (difference.valueOf() > gap.valueOf()) break;
			buffer.push(candidate);
			consumed.add(candidate);
			last = candidate;
		}
		return buffer;
	}

	findGroup(cursor: ArrayCursor<Activity>, root: TypeOf<Activity>): Activity[] {
		const { passThrough, gap } = ReferenceError.suppress(this.#roots.get(root));
		if (passThrough) return this.#findGroupPassThrough(cursor, root, gap);
		return this.#findGroupConsecutive(cursor, root, gap);
	}
}
//#endregion
