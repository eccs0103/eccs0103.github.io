"use strict";

import "adaptive-extender/web";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { StackOverflowActivity, StackOverflowAnswerActivity, StackOverflowQuestionActivity } from "../models/activity.js";
import { DOMBuilder } from "./view-builders.js";

//#region Stack Overflow render strategy
export class StackOverflowRenderStrategy implements ActivityRenderStrategy<StackOverflowActivity> {
	#renderScorePanel(itemContainer: HTMLElement, isSuccessful: boolean, score: number, views: number): void {
		const divPanel = itemContainer.appendChild(document.createElement("div"));
		divPanel.classList.add("score-panel", "flex", "column", "alt-center", "main-center");
		if (isSuccessful) {
			divPanel.classList.add("status-success");
		}

		const spanValue = divPanel.appendChild(document.createElement("span"));
		spanValue.textContent = score.toString();
		spanValue.classList.add("value");

		if (!Number.isNaN(views)) {
			const divViews = divPanel.appendChild(document.createElement("div"));
			divViews.classList.add("view-count", "description");
			const formattedViews = new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(views).toLowerCase();
			divViews.textContent = `${formattedViews} views`;
		}
	}

	#renderTags(itemContainer: HTMLElement, tags: readonly string[]): void {
		if (tags.length < 1) return;

		const divTags = itemContainer.appendChild(document.createElement("div"));
		divTags.classList.add("tags-list", "flex", "with-gap");

		for (const tag of tags) {
			const url = new URL(`https://ru.stackoverflow.com/tags/${tag}`);
			const aTag = divTags.appendChild(DOMBuilder.newLink(tag, url));
			aTag.classList.add("tag", "depth", "rounded", "with-padding");
		}
	}

	#renderSummary(itemContainer: HTMLElement, isSuccessful: boolean, score: number, views: number, context: string, title: string, url: string, tags: readonly string[]): void {
		const summary = itemContainer.appendChild(document.createElement("summary"));
		summary.classList.add("flex", "with-gap");

		this.#renderScorePanel(summary, isSuccessful, score, views);

		const divHeader = summary.appendChild(document.createElement("div"));
		divHeader.classList.add("summary-content");

		divHeader.appendChild(DOMBuilder.newText(context));

		const aTitle = divHeader.appendChild(DOMBuilder.newLink(title, new URL(url)));
		aTitle.classList.add("entry-title");

		const spanHint = divHeader.appendChild(DOMBuilder.newDescription("Click to expand"));
		spanHint.classList.add("expand-hint");

		this.#renderTags(divHeader, tags);
	}

	#renderBody(itemContainer: HTMLElement, htmlContent: string): void {
		const divBody = itemContainer.appendChild(document.createElement("div"));
		divBody.classList.add("entry-body", "markup");
		divBody.innerHTML = htmlContent;
	}

	#renderQuestion(itemContainer: HTMLElement, activity: StackOverflowQuestionActivity): void {
		const { title, score, tags, isAnswered, body, url, views } = activity;

		const details = itemContainer.appendChild(document.createElement("details"));
		details.classList.add("stack-overflow-entry");

		this.#renderSummary(details, isAnswered, score, views, "Asked question: ", title, url, tags);

		this.#renderBody(details, body);
	}

	#renderAnswer(itemContainer: HTMLElement, activity: StackOverflowAnswerActivity): void {
		const { title, score, isAccepted, body, url } = activity;

		const details = itemContainer.appendChild(document.createElement("details"));
		details.classList.add("stack-overflow-entry");

		this.#renderSummary(details, isAccepted, score, NaN, "Answer to: ", title, url, []);

		this.#renderBody(details, body);
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
