"use strict";

import "adaptive-extender/web";
import { Timespan } from "adaptive-extender/web";
import { Activity, GitHubActivity, GitHubPushActivity, GitHubReleaseActivity, GitHubWatchActivity, GitHubCreateTagActivity, GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubDeleteBranchActivity, GitHubDeleteTagActivity, SpotifyActivity, SpotifyLikeActivity, SteamActivity, SteamAchievementActivity } from "../models/activity.js";
import { ArrayCursor } from "../services/array-cursor.js";
import { TextExpert } from "../services/text-expert.js";
import { GitHubSummaryExpert, type LinkerFunction, type PrinterFunction } from "../services/github-summary-expert.js";
import { type Platform } from "../models/platform.js";

const { baseURI } = document;

//#region Activity batcher
type Constructor<T> = abstract new (...args: any) => T;

// Добавил anchor для вставки перед часовым элементом
// Замени блок ActivityBatcher на этот (внутри файла activities-renderer.ts):

type BatchRenderer<T extends Activity> = (activities: readonly T[], platforms: Map<string, Platform>, observer: IntersectionObserver) => void;

class ActivityBatcher {
	#strategies: Map<Constructor<Activity>, BatchRenderer<Activity>> = new Map();

	register<T extends Activity>(root: Constructor<T>, render: BatchRenderer<T>): void {
		this.#strategies.set(root, render as BatchRenderer<Activity>);
	}

	#process<T extends Activity>(cursor: ArrayCursor<Activity>, root: Constructor<T>, gap: Readonly<Timespan>): readonly T[] {
		const buffer: T[] = [];
		let current = cursor.current as T;
		while (true) {
			buffer.push(current);
			cursor.index++;
			if (!cursor.inRange) break;
			const next = cursor.current;
			if (!(next instanceof root)) break;
			const difference = Timespan.fromValue(current.timestamp.valueOf() - next.timestamp.valueOf());
			if (difference.valueOf() > gap.valueOf()) break;
			current = next;
		}
		return Object.freeze(buffer);
	}

	dispatch(cursor: ArrayCursor<Activity>, gap: Readonly<Timespan>, platforms: Map<string, Platform>, observer: IntersectionObserver): boolean {
		const current = cursor.current;
		for (const [root, render] of this.#strategies) {
			if (!(current instanceof root)) continue;
			const activities = this.#process(cursor, root, gap);
			render(activities, platforms, observer);
			return true;
		}
		return false;
	}
}
//#endregion

//#region Activity renderer
export interface ActivityRendererOptions {
	gap: Timespan;
	batch: number;
}

export class ActivitiesRenderer {
	#itemContainer: HTMLElement;
	#batcher: ActivityBatcher;

	constructor(itemContainer: HTMLElement) {
		this.#itemContainer = itemContainer;
		const batcher = this.#batcher = new ActivityBatcher();
		batcher.register(GitHubActivity, this.#renderGitHubBlock.bind(this));
		batcher.register(SpotifyActivity, this.#renderSpotifyBlock.bind(this));
		batcher.register(SteamActivity, this.#renderSteamBlock.bind(this));
	}

	// Observer передаем аргументом, чтобы не хранить в this
	static #newActivity(itemContainer: HTMLElement, platforms: Map<string, Platform>, activity: Activity, observer: IntersectionObserver): HTMLElement {
		const divActivity = itemContainer.insertBefore(document.createElement("div"), itemContainer.lastElementChild);
		divActivity.classList.add("activity", "layer", "rounded", "with-padding", "with-gap", "awaiting-reveal");
		observer.observe(divActivity);

		const platform = platforms.get(activity.platform);
		if (platform !== undefined) {
			const spanIcon = divActivity.appendChild(document.createElement("span"));
			spanIcon.style.setProperty("--url", `url(${new URL(platform.icon, new URL("../", baseURI))})`);
			spanIcon.classList.add("icon");

			const h3Platform = divActivity.appendChild(document.createElement("h4"));
			h3Platform.classList.add("platform");
			h3Platform.textContent = platform.name;
		}

		const timeTimestamp = divActivity.appendChild(document.createElement("time"));
		timeTimestamp.dateTime = activity.timestamp.toISOString();
		timeTimestamp.textContent = TextExpert.formatTime(activity.timestamp);
		timeTimestamp.classList.add("activity-time");

		const divContent = divActivity.appendChild(document.createElement("div"));
		divContent.classList.add("content");

		return divContent;
	}

	static #newText(text: string): Text {
		return document.createTextNode(text);
	}

	static #newLink(text: string, url: string): HTMLAnchorElement;
	static #newLink(text: string, url: string, disabled: boolean): HTMLAnchorElement;
	static #newLink(text: string, url: string, disabled: boolean = false): HTMLAnchorElement {
		const aLink = document.createElement("a");
		aLink.href = url;
		aLink.textContent = text;
		aLink.target = "_blank";
		aLink.rel = "noopener noreferrer";
		aLink.inert = disabled;
		return aLink;
	}

	static #renderGitHubPushActivity(container: HTMLElement, activity: GitHubPushActivity, count: number): void {
		const { url, sha, repository } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Published "));
		container.appendChild(ActivitiesRenderer.#newLink(`${count} update${TextExpert.getPluralSuffix(count)}`, `${url}/commit/${sha}`));
		container.appendChild(ActivitiesRenderer.#newText(" to the source code of "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubReleaseActivity(container: HTMLElement, activity: GitHubReleaseActivity): void {
		const { isPrerelease, title, url, repository } = activity;
		container.appendChild(ActivitiesRenderer.#newText(isPrerelease ? "Rolled out a test version " : "Shipped update "));
		container.appendChild(ActivitiesRenderer.#newLink(title, url));
		container.appendChild(ActivitiesRenderer.#newText(" for "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubWatchActivity(container: HTMLElement, activity: GitHubWatchActivity): void {
		const { repository, url } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Discovered and bookmarked the "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText(" open-source project."));
	}

	static #renderGitHubCreateTagActivity(container: HTMLElement, activity: GitHubCreateTagActivity): void {
		const { name, url, repository } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Marked a new milestone "));
		container.appendChild(ActivitiesRenderer.#newLink(name, `${url}/releases/tag/${name}`));
		container.appendChild(ActivitiesRenderer.#newText(" in "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText(" history."));
	}

	static #renderGitHubCreateBranchActivity(container: HTMLElement, activity: GitHubCreateBranchActivity): void {
		const { name, url, repository } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Started working on a new feature \""));
		container.appendChild(ActivitiesRenderer.#newLink(name, `${url}/tree/${name}`));
		container.appendChild(ActivitiesRenderer.#newText("\" in "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubCreateRepositoryActivity(container: HTMLElement, activity: GitHubCreateRepositoryActivity): void {
		const { name, url } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Initiated a new repository named "));
		container.appendChild(ActivitiesRenderer.#newLink(name, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubDeleteTagActivity(container: HTMLElement, activity: GitHubDeleteTagActivity): void {
		const { name, repository, url } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Unpublished version "));
		container.appendChild(ActivitiesRenderer.#newLink(name, `${url}/releases/tag/${name}`, true));
		container.appendChild(ActivitiesRenderer.#newText(" from "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubDeleteBranchActivity(container: HTMLElement, activity: GitHubDeleteBranchActivity): void {
		const { name, url, repository } = activity;
		container.appendChild(ActivitiesRenderer.#newText("Removed the "));
		container.appendChild(ActivitiesRenderer.#newLink(name, `${url}/tree/${name}`, true));
		container.appendChild(ActivitiesRenderer.#newText(" draft from "));
		container.appendChild(ActivitiesRenderer.#newLink(repository, url));
		container.appendChild(ActivitiesRenderer.#newText("."));
	}

	static #renderGitHubActivity(container: HTMLElement, activity: GitHubActivity): void {
		if (activity instanceof GitHubPushActivity) return ActivitiesRenderer.#renderGitHubPushActivity(container, activity, 1);
		if (activity instanceof GitHubReleaseActivity) return ActivitiesRenderer.#renderGitHubReleaseActivity(container, activity);
		if (activity instanceof GitHubWatchActivity) return ActivitiesRenderer.#renderGitHubWatchActivity(container, activity);
		if (activity instanceof GitHubCreateTagActivity) return ActivitiesRenderer.#renderGitHubCreateTagActivity(container, activity);
		if (activity instanceof GitHubCreateBranchActivity) return ActivitiesRenderer.#renderGitHubCreateBranchActivity(container, activity);
		if (activity instanceof GitHubCreateRepositoryActivity) return ActivitiesRenderer.#renderGitHubCreateRepositoryActivity(container, activity);
		if (activity instanceof GitHubDeleteBranchActivity) return ActivitiesRenderer.#renderGitHubDeleteBranchActivity(container, activity);
		if (activity instanceof GitHubDeleteTagActivity) return ActivitiesRenderer.#renderGitHubDeleteTagActivity(container, activity);
	}

	static #renderSpotifyLikeActivity(itemContainer: HTMLElement, activity: SpotifyLikeActivity): void {
		const { title, cover } = activity;

		const divEmbed = itemContainer.appendChild(document.createElement("div"));
		divEmbed.classList.add("flex", "with-gap");

		if (cover !== null) {
			const imgCover = divEmbed.appendChild(document.createElement("img"));
			imgCover.src = cover;
			imgCover.alt = `'${title}' cover`;
			imgCover.classList.add("rounded", "spotify-cover");
		}

		const divInformation = divEmbed.appendChild(document.createElement("div"));
		divInformation.classList.add("flex", "column");

		const strongTitle = divInformation.appendChild(document.createElement("strong"));
		strongTitle.textContent = title;

		const spanArtist = divInformation.appendChild(document.createElement("span"));
		spanArtist.textContent = activity.artists.join(", ");
		spanArtist.classList.add("description");
		spanArtist.style.fontSize = "0.9em";

		const aReferrer = divInformation.appendChild(ActivitiesRenderer.#newLink("Listen on Spotify ↗", activity.url));
		aReferrer.classList.add("spotify-link", "with-block-padding");
	}

	static #renderSteamAchievementActivity(container: HTMLElement, activity: SteamAchievementActivity): void {
		const { game, title, description, url, icon } = activity;

		const divWrapper = container.appendChild(document.createElement("div"));
		divWrapper.classList.add("flex", "with-gap", "alt-center");

		if (icon !== null) {
			const imgIcon = divWrapper.appendChild(document.createElement("img"));
			imgIcon.src = icon;
			imgIcon.alt = `'${title}' icon`;
			imgIcon.classList.add("rounded", "steam-icon");
		}

		const divText = divWrapper.appendChild(document.createElement("div"));
		divText.classList.add("flex", "column");

		const spanHeader = divText.appendChild(document.createElement("span"));
		spanHeader.appendChild(ActivitiesRenderer.#newText("Earned \""));
		spanHeader.appendChild(ActivitiesRenderer.#newLink(title, url));
		spanHeader.appendChild(ActivitiesRenderer.#newText(`\" in ${game}`));

		if (description !== null && !String.isWhitespace(description)) {
			const spanDescription = divText.appendChild(document.createElement("span"));
			spanDescription.textContent = description;
			spanDescription.classList.add("description");
		}
	}

	#renderGitHubSingle(activity: GitHubActivity, platforms: Map<string, Platform>, observer: IntersectionObserver): void {
		const itemContainer = ActivitiesRenderer.#newActivity(this.#itemContainer, platforms, activity, observer);
		ActivitiesRenderer.#renderGitHubActivity(itemContainer, activity);
	}

	#print(container: HTMLElement, strings: TemplateStringsArray, ...values: any[]): void {
		strings.forEach((string, index) => {
			container.appendChild(ActivitiesRenderer.#newText(string));
			if (index >= values.length) return;
			const value = values[index];
			if (value instanceof Node) {
				container.appendChild(value);
				return;
			}
			container.appendChild(ActivitiesRenderer.#newText(String(value)));
			return;
		});
	}

	#renderCollectionSummary(container: HTMLElement, activities: readonly GitHubActivity[]): void {
		const expert = new GitHubSummaryExpert(activities);
		const linker: LinkerFunction = ActivitiesRenderer.#newLink.bind(ActivitiesRenderer);
		const context = expert.build(linker);
		const template = expert.choose();
		const printer: PrinterFunction = this.#print.bind(this, container);
		template(printer, context);
	}

	#renderGitHubCollection(activities: readonly GitHubActivity[], platforms: Map<string, Platform>, observer: IntersectionObserver): void {
		const itemContainer = ActivitiesRenderer.#newActivity(this.#itemContainer, platforms, activities[0], observer);

		const details = itemContainer.appendChild(document.createElement("details"));
		details.classList.add("github-collection");
		details.open = true;

		const summary = details.appendChild(document.createElement("summary"));

		this.#renderCollectionSummary(summary, activities);

		const ulContent = details.appendChild(document.createElement("ul"));
		ulContent.classList.add("collection-content");

		for (let index = 0; index < activities.length; index++) {
			const activity = activities[index];
			const liActivity = ulContent.appendChild(document.createElement("li"));

			if (!(activity instanceof GitHubPushActivity)) {
				ActivitiesRenderer.#renderGitHubActivity(liActivity, activity);
				continue;
			}

			let count = 1;
			while (index + 1 < activities.length) {
				const current = activities[index + 1];
				if (!(current instanceof GitHubPushActivity)) break;
				if (current.repository !== activity.repository) break;
				count++;
				index++;
			}
			ActivitiesRenderer.#renderGitHubPushActivity(liActivity, activity, count);
		}
	}

	#renderGitHubBlock(buffer: readonly GitHubActivity[], platforms: Map<string, Platform>, observer: IntersectionObserver): void {
		if (buffer.length > 1) return this.#renderGitHubCollection(buffer, platforms, observer);
		return this.#renderGitHubSingle(buffer[0], platforms, observer);
	}

	#renderSpotifyBlock(buffer: readonly SpotifyActivity[], platforms: Map<string, Platform>, observer: IntersectionObserver): void {
		const itemContainer = ActivitiesRenderer.#newActivity(this.#itemContainer, platforms, buffer[0], observer);
		itemContainer.classList.add("flex", "column", "with-gap");

		const spanAction = itemContainer.appendChild(document.createElement("span"));
		spanAction.textContent = "Added to music collection";

		for (const activity of buffer) {
			if (activity instanceof SpotifyLikeActivity) {
				ActivitiesRenderer.#renderSpotifyLikeActivity(itemContainer, activity);
				continue;
			}
		}
	}

	#renderSteamBlock(buffer: readonly SteamActivity[], platforms: Map<string, Platform>, observer: IntersectionObserver): void {
		const itemContainer = ActivitiesRenderer.#newActivity(this.#itemContainer, platforms, buffer[0], observer);
		itemContainer.classList.add("flex", "column", "with-gap");

		for (const activity of buffer) {
			if (activity instanceof SteamAchievementActivity) {
				ActivitiesRenderer.#renderSteamAchievementActivity(itemContainer, activity);
				continue;
			}
		}
	}

	// ВАЖНО: Пришлось расширить сигнатуру BatchRenderer и dispatch, чтобы прокинуть observer.
	// Это минимальное вмешательство.

	async render(activities: readonly Activity[], platforms: readonly Platform[]): Promise<void>;
	async render(activities: readonly Activity[], platforms: readonly Platform[], options: Partial<ActivityRendererOptions>): Promise<void>;
	async render(activities: readonly Activity[], platforms: readonly Platform[], options: Partial<ActivityRendererOptions> = {}): Promise<void> {
		let { gap, batch } = options;
		gap ??= Timespan.newDay;
		batch ??= 15;

		const cursor = new ArrayCursor(activities);
		const mapping = new Map(platforms.map(platform => [platform.name, platform]));

		// 1. Аниматор (локальный)
		const observerAnimatedReveal = new IntersectionObserver((entries) => {
			for (const { isIntersecting, target } of entries) {
				if (!isIntersecting) continue;
				target.classList.add("revealed");
				observerAnimatedReveal.unobserve(target);
			}
		}, { threshold: 0.1 });

		// 2. Хак для Batcher, чтобы прокинуть observer (динамическая подмена dispatch)
		// Твой Batcher вызывает render(buffer, platforms, anchor).
		// Моим методам нужен observer.
		// Трюк: переопределим dispatch временно или изменим сигнатуру Batcher (я изменил сигнатуру выше в типах).
		// Теперь dispatch принимает observer.

		// 3. Часовой (Sentinel)
		const sentinel = document.createElement("div");
		sentinel.style.height = "1px";
		sentinel.style.width = "100%";
		this.#itemContainer.appendChild(sentinel);

		// // 4. Логика подгрузки (Infinite Scroll)
		const loadChunk = (cursor: ArrayCursor<Activity>) => {
			const batcher = this.#batcher;
			let rendered = 0;
			while (cursor.inRange && rendered < batch) {
				const processed = batcher.dispatch(cursor, gap, mapping, observerAnimatedReveal);
				if (!processed) {
					cursor.index++;
					continue;
				}
				rendered++;
			}
			if (!cursor.inRange) {
				observerDynamicScroll.disconnect();
				sentinel.remove();
			}
		};

		const observerDynamicScroll = new IntersectionObserver(([sentinel]) => {
			if (sentinel.isIntersecting) loadChunk(cursor);
		}, { rootMargin: "200px" });

		observerDynamicScroll.observe(sentinel);

		// Первая загрузка
		loadChunk(cursor);
	}
}
//#endregion
