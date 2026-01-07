"use strict";

import "adaptive-extender/web";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { StackOverflowActivity, StackOverflowAnswerActivity, StackOverflowQuestionActivity } from "../models/activity.js";
import { DOMBuilder } from "./view-builders.js";

//#region Stack Overflow render strategy
export class StackOverflowRenderStrategy implements ActivityRenderStrategy<StackOverflowActivity> {

	#renderScoreBox(itemContainer: HTMLElement, score: number, successMessage: string | null): void {
		const divScore = itemContainer.appendChild(document.createElement("div"));
		divScore.classList.add("so-score-box", "flex", "column", "alt-center", "main-center");

		if (successMessage !== null) {
			divScore.classList.add("status-success");
			divScore.title = successMessage;
		}

		const spanValue = divScore.appendChild(document.createElement("span"));
		spanValue.textContent = score.toString();
		spanValue.classList.add("score-value");

		const spanLabel = divScore.appendChild(document.createElement("span"));
		spanLabel.textContent = "score";
		spanLabel.classList.add("score-label");
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

	#renderBody(itemContainer: HTMLElement, bodyHTML: string): void {
		const details = itemContainer.appendChild(document.createElement("details"));
		details.classList.add("so-details");

		const summary = details.appendChild(document.createElement("summary"));
		summary.textContent = "Show content";

		const divContent = details.appendChild(document.createElement("div"));
		divContent.classList.add("so-body", "markup");
		divContent.innerHTML = bodyHTML;
	}

	#renderQuestion(itemContainer: HTMLElement, activity: StackOverflowQuestionActivity): void {
		const { title, score, tags, isAnswered, body, url, views } = activity;

		const divWrapper = itemContainer.appendChild(document.createElement("div"));
		divWrapper.classList.add("so-card", "flex", "with-gap");

		this.#renderScoreBox(divWrapper, score, isAnswered ? "Question has an accepted answer" : null);

		const divMain = divWrapper.appendChild(document.createElement("div"));
		divMain.classList.add("flex", "column", "so-content-area");

		if (views !== undefined) {
			const divMeta = divMain.appendChild(document.createElement("div"));
			divMeta.classList.add("so-header-meta");
			divMeta.textContent = `${views} views`;
		}

		const aTitle = divMain.appendChild(DOMBuilder.newLink(title, new URL(url)));
		aTitle.classList.add("so-title");

		this.#renderBody(divMain, body);
		this.#renderTags(divMain, tags);
	}

	#renderAnswer(itemContainer: HTMLElement, activity: StackOverflowAnswerActivity): void {
		const { title, score, isAccepted, body, url } = activity;

		const divWrapper = itemContainer.appendChild(document.createElement("div"));
		divWrapper.classList.add("so-card", "flex", "with-gap");

		this.#renderScoreBox(divWrapper, score, isAccepted ? "This answer is accepted" : null);

		const divMain = divWrapper.appendChild(document.createElement("div"));
		divMain.classList.add("flex", "column", "so-content-area");

		const divHeader = divMain.appendChild(document.createElement("div"));
		divHeader.classList.add("so-header-line");
		divHeader.appendChild(DOMBuilder.newText("Answer to: "));

		const aTitle = divHeader.appendChild(DOMBuilder.newLink(title, new URL(url)));
		aTitle.classList.add("so-title");

		this.#renderBody(divMain, body);
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
