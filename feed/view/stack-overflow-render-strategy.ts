"use strict";

import "adaptive-extender/web";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { StackOverflowActivity, StackOverflowAnswerActivity, StackOverflowQuestionActivity } from "../models/activity.js";
import { DOMBuilder } from "./view-builders.js";

//#region Stack Overflow render strategy
export class StackOverflowRenderStrategy implements ActivityRenderStrategy<StackOverflowActivity> {

	#renderScoreBox(itemContainer: HTMLElement, score: number, successMessage: string | null, views: number | null): void {
		const divScore = itemContainer.appendChild(document.createElement("div"));
		divScore.classList.add("so-score-box", "flex", "column", "alt-center", "main-center");

		if (successMessage !== null) {
			divScore.classList.add("status-success");
			divScore.title = successMessage;
		}

		const spanValue = divScore.appendChild(document.createElement("span"));
		spanValue.textContent = score.toString();
		spanValue.classList.add("score-value");

		if (views !== null) {
			const divViews = divScore.appendChild(document.createElement("div"));
			divViews.classList.add("view-count", "description");
			divViews.textContent = `${new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(views).toLowerCase()} views`;
			divViews.title = `${views} views`;
		}
	}

	#renderTags(itemContainer: HTMLElement, tags: readonly string[]): void {
		if (tags.length < 1) return;

		const divTags = itemContainer.appendChild(document.createElement("div"));
		divTags.classList.add("so-tags", "flex", "with-gap");

		for (const tag of tags) {
			const url = new URL(`https://ru.stackoverflow.com/tags/${tag}`);
			const aTag = divTags.appendChild(DOMBuilder.newLink(tag, url));
			aTag.classList.add("tag", "depth", "rounded", "with-padding");
		}
	}

	#renderContent(container: HTMLElement, introText: string, title: string, url: string, bodyHTML: string): void {
		const details = container.appendChild(document.createElement("details"));
		details.classList.add("so-details");

		const summary = details.appendChild(document.createElement("summary"));

		const divHeaderLine = summary.appendChild(document.createElement("div"));
		divHeaderLine.classList.add("so-header-line");

		// "Asked question: " или "Answer to: "
		divHeaderLine.appendChild(DOMBuilder.newText(introText));

		// Сама ссылка.
		const aTitle = divHeaderLine.appendChild(DOMBuilder.newLink(title, new URL(url)));
		aTitle.classList.add("so-title");

		// 2. Body (скрыто внутри details)
		const divBody = details.appendChild(document.createElement("div"));
		divBody.classList.add("so-body", "markup");
		divBody.innerHTML = bodyHTML;
	}

	#renderQuestion(itemContainer: HTMLElement, activity: StackOverflowQuestionActivity): void {
		// @ts-ignore: views может отсутствовать в типах, но приходить с бэка
		const { title, score, tags, isAnswered, body, url, views } = activity;

		const divWrapper = itemContainer.appendChild(document.createElement("div"));
		divWrapper.classList.add("so-card", "flex", "with-gap");

		// Left: Score Box (c views)
		this.#renderScoreBox(divWrapper, score, isAnswered ? "Question has an accepted answer" : null, views);

		// Right: Content Area
		const divMain = divWrapper.appendChild(document.createElement("div"));
		divMain.classList.add("flex", "column", "so-content-area");

		// Details (Header + Body)
		this.#renderContent(divMain, "Asked question: ", title, url, body);

		// Tags (всегда видны, под details)
		this.#renderTags(divMain, tags);
	}

	#renderAnswer(itemContainer: HTMLElement, activity: StackOverflowAnswerActivity): void {
		const { title, score, isAccepted, body, url } = activity;

		const divWrapper = itemContainer.appendChild(document.createElement("div"));
		divWrapper.classList.add("so-card", "flex", "with-gap");

		// Left: Score Box
		this.#renderScoreBox(divWrapper, score, isAccepted ? "This answer is accepted" : null, null);

		// Right: Content Area
		const divMain = divWrapper.appendChild(document.createElement("div"));
		divMain.classList.add("flex", "column", "so-content-area");

		// Details (Header + Body)
		this.#renderContent(divMain, "Answer to: ", title, url, body);
	}

	#renderSingle(itemContainer: HTMLElement, activity: StackOverflowActivity): void {
		if (activity instanceof StackOverflowQuestionActivity) return this.#renderQuestion(itemContainer, activity);
		if (activity instanceof StackOverflowAnswerActivity) return this.#renderAnswer(itemContainer, activity);
	}

	render(itemContainer: HTMLElement, buffer: readonly StackOverflowActivity[]): void {
		itemContainer.classList.add("flex", "column", "with-gap");
		for (const activity of buffer) {
			this.#renderSingle(itemContainer, activity);
		}
	}
}
//#endregion
