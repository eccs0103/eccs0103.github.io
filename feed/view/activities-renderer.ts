"use strict";

import "adaptive-extender/web";
import { Timespan } from "adaptive-extender/web";
import { Activity, GitHubActivity, SpotifyActivity, SteamActivity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";
import { type Platform } from "../models/platform.js";
import { ActivityBuilder, DOMBuilder } from "./view-builders.js";
import { GitHubRenderStrategy } from "./github-render-strategy.js";
import { SpotifyRenderStrategy } from "./spotify-render-strategy.js";
import { SteamRenderStrategy } from "./steam-render-strategy.js";
import { ActivityCollector, type TypeOf } from "../services/activity-collector.js";

//#region Activities renderer
export interface ActivityRenderStrategy<T extends Activity> {
	render(itemContainer: HTMLElement, buffer: readonly T[]): void;
}

interface RenderContext {
	cursor: ArrayCursor<Activity>;
	collector: ActivityCollector;
	platforms: Map<string, Platform>;
	batch: number;
	observerAnimatedReveal: IntersectionObserver;
	observerDynamicLoad: IntersectionObserver;
	itemSentinel: HTMLElement;
}

export interface ActivitiesRendererOptions {
	gap: Timespan;
	batch: number;
}

export class ActivitiesRenderer {
	#itemContainer: HTMLElement;
	#strategies: Map<TypeOf<Activity>, ActivityRenderStrategy<Activity>> = new Map();
	#isSentinelIntersecting: boolean = true;

	constructor(itemContainer: HTMLElement) {
		this.#itemContainer = itemContainer;
		this.registerStrategy(GitHubActivity, new GitHubRenderStrategy);
		this.registerStrategy(SpotifyActivity, new SpotifyRenderStrategy);
		this.registerStrategy(SteamActivity, new SteamRenderStrategy);
	}

	registerStrategy<T extends Activity>(root: TypeOf<T>, strategy: ActivityRenderStrategy<T>): void {
		this.#strategies.set(root, strategy);
	}

	#renderChunk(cursor: ArrayCursor<Activity>, collector: ActivityCollector, platforms: Map<string, Platform>, batch: number, observerAnimatedReveal: IntersectionObserver): boolean {
		let rendered = 0;
		while (cursor.inRange && rendered < batch) {
			const root = collector.findRoot(cursor.current);
			if (root === null) {
				cursor.index++;
				continue;
			}
			const buffer = collector.findGroup(cursor, root);
			if (buffer.length < 1) {
				cursor.index++;
				continue;
			}
			const strategy = this.#strategies.get(root);
			if (strategy === undefined) continue;
			const itemContainer = ActivityBuilder.newContainer(this.#itemContainer, platforms, buffer[0], observerAnimatedReveal);
			strategy.render(itemContainer, buffer);
			rendered++;
		}
		return cursor.inRange;
	}

	#render(context: RenderContext): unknown {
		if (!this.#isSentinelIntersecting) return;
		const { cursor, collector, platforms, batch, observerAnimatedReveal, observerDynamicLoad, itemSentinel } = context;
		const hasMore = this.#renderChunk(cursor, collector, platforms, batch, observerAnimatedReveal);
		if (hasMore) return requestAnimationFrame(this.#render.bind(this, context));
		observerDynamicLoad.disconnect();
		const itemEnding = DOMBuilder.newDescription("At the moment these are all the records.");
		itemEnding.classList.add("ending");
		this.#itemContainer.replaceChild(itemEnding, itemSentinel);
	}

	async render(activities: readonly Activity[], platforms: readonly Platform[]): Promise<void>;
	async render(activities: readonly Activity[], platforms: readonly Platform[], options: Partial<ActivitiesRendererOptions>): Promise<void>;
	async render(activities: readonly Activity[], platforms: readonly Platform[], options: Partial<ActivitiesRendererOptions> = {}): Promise<void> {
		const gap = options.gap ?? Timespan.newDay;
		const batch = options.batch ?? 10;
		const mapping = new Map(platforms.map(platform => [platform.name, platform]));
		const cursor = new ArrayCursor(activities);

		const collector = new ActivityCollector(gap);
		for (const [root] of this.#strategies) {
			collector.register(root);
		}

		const observerAnimatedReveal = new IntersectionObserver((entries) => {
			for (const { isIntersecting, target } of entries) {
				if (!isIntersecting) continue;
				target.classList.add("revealed");
				observerAnimatedReveal.unobserve(target);
			}
		}, { threshold: 0.1 });

		const itemSentinel = ActivityBuilder.newSentinel(this.#itemContainer);
		const observerDynamicLoad = new IntersectionObserver(([entry]) => {
			this.#isSentinelIntersecting = entry.isIntersecting;
			this.#render(context);
		}, { rootMargin: "200px" });
		const context: RenderContext = { cursor, collector, platforms: mapping, batch, observerAnimatedReveal, observerDynamicLoad, itemSentinel };
		observerDynamicLoad.observe(itemSentinel);
		this.#render(context);
	}
}
//#endregion
