"use strict";

import "adaptive-extender/web";
import { Timespan } from "adaptive-extender/web";
import { Activity, GitHubActivity, SpotifyActivity, StackOverflowActivity, SteamAchievementActivity, SteamScreenshotActivity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";
import { Configuration, type Platform } from "../models/configuration.js";
import { ActivityBuilder } from "./view-builders.js";
import { GitHubRenderStrategy } from "./github-render-strategy.js";
import { SpotifyRenderStrategy } from "./spotify-render-strategy.js";
import { SteamRenderStrategy } from "./steam-render-strategy.js";
import { ActivityCollector, type TypeOf } from "../services/activity-collector.js";
import { type DataTable } from "../services/data-table.js";
import { StackOverflowRenderStrategy } from "./stack-overflow-render-strategy.js";

//#region Activities renderer
export interface ActivityRenderStrategy<T extends Activity> {
	render(itemContainer: HTMLElement, buffer: readonly T[]): void;
}

interface RenderContext {
	cursor: ArrayCursor<Activity>;
	collector: ActivityCollector;
	platforms: Map<string, Platform>;
	outro: string;
	batch: number;
	observerAnimatedReveal: IntersectionObserver;
	observerDynamicLoad: IntersectionObserver;
	itemSentinel: HTMLElement;
	activities: DataTable<typeof Activity>;
}

export interface ActivitiesRendererOptions {
	gap: Timespan;
	batch: number;
}

export class ActivitiesRenderer {
	#itemContainer: HTMLElement;
	#strategies: Map<TypeOf<Activity>, ActivityRenderStrategy<Activity>> = new Map();
	#isSentinelIntersecting: boolean = true;
	#page: number = 0;
	#isLoading: boolean = false;

	constructor(itemContainer: HTMLElement) {
		this.#itemContainer = itemContainer;
		this.registerStrategy(GitHubActivity, new GitHubRenderStrategy);
		this.registerStrategy(SpotifyActivity, new SpotifyRenderStrategy);
		this.registerStrategy(SteamAchievementActivity, new SteamRenderStrategy);
		this.registerStrategy(SteamScreenshotActivity, new SteamRenderStrategy);
		this.registerStrategy(StackOverflowActivity, new StackOverflowRenderStrategy);
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

	async #render(context: RenderContext): Promise<unknown> {
		if (!this.#isSentinelIntersecting) return;
		const { cursor, collector, platforms, outro, batch, observerAnimatedReveal, observerDynamicLoad, itemSentinel, activities } = context;
		const hasMore = this.#renderChunk(cursor, collector, platforms, batch, observerAnimatedReveal);
		if (hasMore) return requestAnimationFrame(this.#render.bind(this, context));

		if (this.#isLoading) return;
		this.#isLoading = true;
		const isLoaded = await activities.load(this.#page++);
		this.#isLoading = false;
		if (isLoaded) return requestAnimationFrame(this.#render.bind(this, context));

		observerDynamicLoad.disconnect();
		ActivityBuilder.newOutro(this.#itemContainer, itemSentinel, outro);
	}

	async render(activities: DataTable<typeof Activity>, configuration: Configuration): Promise<void>;
	async render(activities: DataTable<typeof Activity>, configuration: Configuration, options: Partial<ActivitiesRendererOptions>): Promise<void>;
	async render(activities: DataTable<typeof Activity>, configuration: Configuration, options: Partial<ActivitiesRendererOptions> = {}): Promise<void> {
		const itemContainer = this.#itemContainer;
		const gap = options.gap ?? Timespan.newDay;
		const outro = configuration.outro;
		const batch = options.batch ?? 10;
		const platforms = new Map(configuration.platforms.map(platform => [platform.name, platform]));
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

		ActivityBuilder.newWarning(itemContainer);
		ActivityBuilder.newIntro(itemContainer, configuration.intro);

		const itemSentinel = ActivityBuilder.newSentinel(itemContainer);
		const observerDynamicLoad = new IntersectionObserver(([entry]) => {
			this.#isSentinelIntersecting = entry.isIntersecting;
			this.#render(context);
		}, { rootMargin: "200px" });
		const context: RenderContext = { cursor, collector, platforms, outro, batch, observerAnimatedReveal, observerDynamicLoad, itemSentinel, activities };
		observerDynamicLoad.observe(itemSentinel);
		this.#render(context);
	}
}
//#endregion
