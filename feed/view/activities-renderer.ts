"use strict";

import "adaptive-extender/web";
import { Timespan } from "adaptive-extender/web";
import { Activity, GitHubActivity, SpotifyActivity, SteamActivity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";
import { type Platform } from "../models/platform.js";
import { ActivityBuilder } from "./view-builders.js";
import { GitHubRenderStrategy } from "./github-render-strategy.js";
import { SpotifyRenderStrategy } from "./spotify-render-strategy.js";
import { SteamRenderStrategy } from "./steam-render-strategy.js";

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

	collect(cursor: ArrayCursor<Activity>): [TypeOf<Activity>, Activity[]] | null {
		const current = cursor.current;
		let targetRoot: TypeOf<Activity> | null = null;

		for (const root of this.#roots) {
			if (current instanceof root) {
				targetRoot = root;
				break;
			}
		}

		if (targetRoot === null) return null;

		const buffer: Activity[] = [current];
		cursor.index++;

		while (cursor.inRange) {
			const next = cursor.current;
			if (!this.#isSameGroup(current, next, targetRoot)) break;
			buffer.push(next);
			cursor.index++;
		}

		return [targetRoot, buffer];
	}
}
//#endregion
//#region Activities renderer
export interface ActivityRenderStrategy<T extends Activity> {
	render(itemContainer: HTMLElement, buffer: readonly T[]): void;
}

export interface ActivitiesRendererOptions {
	gap: Timespan;
	batch: number;
}

export class ActivitiesRenderer {
	#container: HTMLElement;
	#strategies: Map<TypeOf<Activity>, ActivityRenderStrategy<Activity>> = new Map();

	constructor(container: HTMLElement) {
		this.#container = container;
		this.#registerDefaultStrategies();
	}

	registerStrategy<T extends Activity>(root: TypeOf<T>, strategy: ActivityRenderStrategy<T>): void {
		this.#strategies.set(root, strategy);
	}

	#registerDefaultStrategies(): void {
		this.registerStrategy(GitHubActivity, new GitHubRenderStrategy);
		this.registerStrategy(SpotifyActivity, new SpotifyRenderStrategy);
		this.registerStrategy(SteamActivity, new SteamRenderStrategy);
	}

	#renderChunk(cursor: ArrayCursor<Activity>, grouper: ActivityCollector, platforms: Map<string, Platform>, batchSize: number, revealObserver: IntersectionObserver): boolean {
		let renderedCount = 0;

		while (cursor.inRange && renderedCount < batchSize) {
			const group = grouper.collect(cursor);

			if (group === null) {
				cursor.index++;
				continue;
			}
			const [root, buffer] = group;

			const strategy = this.#strategies.get(root);
			if (strategy === undefined) {
				continue;
			}

			const contentContainer = ActivityBuilder.newContainer(this.#container, platforms, buffer[0]);
			strategy.render(contentContainer, buffer);

			if (contentContainer.parentElement !== null) {
				revealObserver.observe(contentContainer.parentElement);
			}

			renderedCount++;
		}

		return cursor.inRange;
	}

	async render(activities: readonly Activity[], platforms: readonly Platform[], options: Partial<ActivitiesRendererOptions> = {}): Promise<void> {
		const gap = options.gap ?? Timespan.newDay;
		const batchSize = options.batch ?? 15;
		const platformMap = new Map(platforms.map(p => [p.name, p]));

		const cursor = new ArrayCursor(activities);
		const grouper = new ActivityCollector(gap);

		for (const root of this.#strategies.keys()) {
			grouper.register(root);
		}

		const revealObserver = new IntersectionObserver((entries) => {
			for (const { isIntersecting, target } of entries) {
				if (!isIntersecting) continue;
				target.classList.add("revealed");
				revealObserver.unobserve(target);
			}
		}, { threshold: 0.1 });

		const sentinel = document.createElement("div");
		sentinel.style.height = "1px";
		sentinel.style.width = "100%";
		this.#container.appendChild(sentinel);

		const scrollObserver = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			const hasMore = this.#renderChunk(cursor, grouper, platformMap, batchSize, revealObserver);
			if (!hasMore) {
				scrollObserver.disconnect();
				sentinel.remove();
			}
		}, { rootMargin: "200px" });

		scrollObserver.observe(sentinel);

		const initialHasMore = this.#renderChunk(cursor, grouper, platformMap, batchSize, revealObserver);
		if (!initialHasMore) {
			scrollObserver.disconnect();
			sentinel.remove();
		}
	}
}
//#endregion
