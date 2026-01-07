"use strict";

import "adaptive-extender/web";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { StackOverflowActivity, StackOverflowAnswerActivity, StackOverflowQuestionActivity } from "../models/activity.js";
import { DOMBuilder } from "./view-builders.js";

//#region Stack Overflow render strategy
export class StackOverflowRenderStrategy implements ActivityRenderStrategy<StackOverflowActivity> {
	#renderQuestion(itemContainer: HTMLElement, activity: StackOverflowQuestionActivity): void {
		const { title, score, tags, isAnswered, body, url } = activity;

		const details = itemContainer.appendChild(document.createElement("details"));
		details.classList.add("stack-overflow");

		const summary = details.appendChild(document.createElement("summary"));
		const divHeader = summary.appendChild(document.createElement("div"));
		divHeader.classList.add("flex", "with-gap", "alt-center");

		const strongTitle = divHeader.appendChild(document.createElement("strong"));
		strongTitle.textContent = title;

		if (isAnswered) {
			const spanAnswered = divHeader.appendChild(document.createElement("span"));
			spanAnswered.textContent = "✓";
			spanAnswered.title = "Answered";
			spanAnswered.classList.add("highlight", "bold");
		}

		const spanScore = divHeader.appendChild(document.createElement("span"));
		spanScore.textContent = `Score: ${score}`;
		spanScore.classList.add("description");

		const divContent = details.appendChild(document.createElement("div"));
		divContent.classList.add("stack-overflow-content", "flex", "column", "with-gap");

		const divBody = divContent.appendChild(document.createElement("div"));
		divBody.innerHTML = body;
		divBody.classList.add("markup");

		if (tags.length > 0) {
			const divTags = divContent.appendChild(document.createElement("div"));
			divTags.classList.add("flex", "with-gap", "tags");
			for (const tag of tags) {
				const spanTag = divTags.appendChild(document.createElement("span"));
				spanTag.textContent = tag;
				spanTag.classList.add("tag");
			}
		}

		const aLink = divContent.appendChild(DOMBuilder.newLink("View on Stack Overflow ↗", new URL(url)));
		aLink.classList.add("self-end");
	}

	#renderAnswer(itemContainer: HTMLElement, activity: StackOverflowAnswerActivity): void {
		const { title, score, isAccepted, body, url } = activity;

		const details = itemContainer.appendChild(document.createElement("details"));
		details.classList.add("stack-overflow");

		const summary = details.appendChild(document.createElement("summary"));
		const divHeader = summary.appendChild(document.createElement("div"));
		divHeader.classList.add("flex", "with-gap", "alt-center");

		const strongTitle = divHeader.appendChild(document.createElement("strong"));
		strongTitle.textContent = title;

		if (isAccepted) {
			const spanAccepted = divHeader.appendChild(document.createElement("span"));
			spanAccepted.textContent = "✓";
			spanAccepted.title = "Accepted";
			spanAccepted.classList.add("highlight", "bold");
		}

		const spanScore = divHeader.appendChild(document.createElement("span"));
		spanScore.textContent = `Score: ${score}`;
		spanScore.classList.add("description");

		const divContent = details.appendChild(document.createElement("div"));
		divContent.classList.add("stack-overflow-content", "flex", "column", "with-gap");

		const divBody = divContent.appendChild(document.createElement("div"));
		divBody.innerHTML = body;
		divBody.classList.add("markup");

		const aLink = divContent.appendChild(DOMBuilder.newLink("View on Stack Overflow ↗", new URL(url)));
		aLink.classList.add("self-end");
	}

	#renderSingle(itemContainer: HTMLElement, activity: StackOverflowActivity): void {
		if (activity instanceof StackOverflowQuestionActivity) return this.#renderQuestion(itemContainer, activity);
		if (activity instanceof StackOverflowAnswerActivity) return this.#renderAnswer(itemContainer, activity);
	}

	render(itemContainer: HTMLElement, buffer: readonly StackOverflowActivity[]): void {
		itemContainer.classList.add("flex", "column", "with-gap");

		const spanLabel = itemContainer.appendChild(document.createElement("span"));
		spanLabel.classList.add("activity-label");
		spanLabel.textContent = "Stack Overflow Activity";

		for (const activity of buffer) {
			this.#renderSingle(itemContainer, activity);
		}
	}
}
//#endregion
