"use strict";

import "adaptive-extender/web";
import { Controller, Timespan } from "adaptive-extender/web";
import { Activity, GitHubActivity, SpotifyActivity, StackOverflowActivity, SteamAchievementActivity, SteamScreenshotActivity, TelegramActivity, TelegramMediaPostActivity, TelegramTextPostActivity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";
import { Configuration, type Platform } from "../models/configuration.js";
import { ActivityBuilder } from "./view-builders.js";
import { GitHubRenderStrategy } from "./github-render-strategy.js";
import { SpotifyRenderStrategy } from "./spotify-render-strategy.js";
import { SteamRenderStrategy } from "./steam-render-strategy.js";
import { ActivityCollector, type TypeOf } from "../services/activity-collector.js";
import { type DataTable } from "../services/data-table.js";
import { StackOverflowRenderStrategy } from "./stack-overflow-render-strategy.js";
import { TelegramRenderStrategy } from "./telegram-render-strategy.js";
import { analytics } from "../../environment/services/analytics-service.js";
import { FeedBatchLoaded } from "../models/feed-batch-loaded.js";
import { FeedCompleted } from "../models/feed-completed.js";
import { MediaPlay } from "../models/media-play.js";

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

export interface StrategyOptions {
	gap: Timespan;
}

export interface ActivitiesRendererOptions {
	batch: number;
}

export class ActivitiesRenderer extends Controller<[HTMLElement, URL, DataTable<typeof Activity>, Configuration]> {
	#strategies: Map<TypeOf<Activity>, [ActivityRenderStrategy<Activity>, Partial<StrategyOptions>]> = new Map();
	#isSentinelIntersecting: boolean = true;
	#page: number = 0;
	#isLoading: boolean = false;

	#attachMediaController(itemContainer: HTMLElement): void {
		itemContainer.addEventListener("play", (event) => {
			const playing = event.target;
			if (!(playing instanceof HTMLMediaElement)) return;
			if (!playing.muted) analytics.dispatch("media_play", new MediaPlay(playing.tagName.toLowerCase()));
			for (const element of itemContainer.getElements(HTMLMediaElement, "video, audio")) {
				if (element === playing || element.muted || element.paused) continue;
				element.pause();
			}
		}, true);
	}

	registerStrategy<T extends Activity>(root: TypeOf<T>, strategy: ActivityRenderStrategy<T>): void;
	registerStrategy<T extends Activity>(root: TypeOf<T>, strategy: ActivityRenderStrategy<T>, options: Partial<StrategyOptions>): void;
	registerStrategy<T extends Activity>(root: TypeOf<T>, strategy: ActivityRenderStrategy<T>, options: Partial<StrategyOptions> = {}): void {
		this.#strategies.set(root, [strategy, options]);
	}

	#renderChunk(itemContainer: HTMLElement, cursor: ArrayCursor<Activity>, collector: ActivityCollector, platforms: Map<string, Platform>, batch: number, observerAnimatedReveal: IntersectionObserver, isFinal: boolean): boolean {
		let rendered = 0;
		while (cursor.inRange && rendered < batch) {
			const index = cursor.index;
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
			if (!isFinal && !cursor.inRange) {
				cursor.index = index;
				return false;
			}
			const entry = this.#strategies.get(root);
			if (entry === undefined) continue;
			const [strategy] = entry;
			const activity = ActivityBuilder.newContainer(itemContainer, platforms, buffer[0], observerAnimatedReveal);
			strategy.render(activity, buffer);
			rendered++;
		}
		return cursor.inRange;
	}

	async #render(itemContainer: HTMLElement, context: RenderContext): Promise<unknown> {
		if (!this.#isSentinelIntersecting) return;
		const { cursor, collector, platforms, outro, batch, observerAnimatedReveal, observerDynamicLoad, itemSentinel, activities } = context;
		const hasMore = this.#renderChunk(itemContainer, cursor, collector, platforms, batch, observerAnimatedReveal, false);
		if (hasMore) return requestAnimationFrame(this.#render.bind(this, itemContainer, context));

		if (this.#isLoading) return;
		this.#isLoading = true;
		const isLoaded = await activities.load(this.#page++);
		this.#isLoading = false;
		if (isLoaded) {
			analytics.dispatch("feed_batch_loaded", new FeedBatchLoaded(this.#page));
			return requestAnimationFrame(this.#render.bind(this, itemContainer, context));
		}

		analytics.dispatch("feed_completed", new FeedCompleted(this.#page));
		this.#renderChunk(itemContainer, cursor, collector, platforms, batch, observerAnimatedReveal, true);
		observerDynamicLoad.disconnect();
		ActivityBuilder.newOutro(itemContainer, itemSentinel, outro);
	}

	async run(itemContainer: HTMLElement, urlProxy: URL, activities: DataTable<typeof Activity>, configuration: Configuration, options: Partial<ActivitiesRendererOptions> = {}): Promise<void> {
		this.#attachMediaController(itemContainer);
		this.registerStrategy(GitHubActivity, new GitHubRenderStrategy());
		this.registerStrategy(SpotifyActivity, new SpotifyRenderStrategy());
		this.registerStrategy(SteamAchievementActivity, new SteamRenderStrategy());
		this.registerStrategy(SteamScreenshotActivity, new SteamRenderStrategy());
		this.registerStrategy(StackOverflowActivity, new StackOverflowRenderStrategy());
		this.registerStrategy(TelegramActivity, new TelegramRenderStrategy(urlProxy), { gap: Timespan.newZero });

		const outro = configuration.outro;
		const batch = options.batch ?? 10;
		const platforms = new Map(configuration.platforms.map(platform => [platform.name, platform]));
		const cursor = new ArrayCursor(activities);

		const collector = new ActivityCollector();
		for (const [root, [, { gap }]] of this.#strategies) {
			collector.register(root, { gap });
		}

		const observerAnimatedReveal = new IntersectionObserver((entries) => {
			for (const { isIntersecting, target } of entries) {
				if (!isIntersecting) continue;
				target.classList.add("revealed");
				observerAnimatedReveal.unobserve(target);
			}
		}, { threshold: 0.1 });

		ActivityBuilder.newIntro(itemContainer, configuration.intro);

		const itemSentinel = ActivityBuilder.newSentinel(itemContainer);
		const observerDynamicLoad = new IntersectionObserver(([entry]) => {
			this.#isSentinelIntersecting = entry.isIntersecting;
			this.#render(itemContainer, context);
		}, { rootMargin: "200px" });
		const context: RenderContext = { cursor, collector, platforms, outro, batch, observerAnimatedReveal, observerDynamicLoad, itemSentinel, activities };
		observerDynamicLoad.observe(itemSentinel);
		this.#render(itemContainer, context);
	}
}
//#endregion
