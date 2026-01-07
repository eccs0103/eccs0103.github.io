"use strict";

import "adaptive-extender/web";
import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { StackOverflowActivity, StackOverflowAnswerActivity, StackOverflowQuestionActivity } from "../models/activity.js";
import { DOMBuilder } from "./view-builders.js";

//#region Stack Overflow render strategy
export class StackOverflowRenderStrategy implements ActivityRenderStrategy<StackOverflowActivity> {
	#renderStatus(container: HTMLElement, isSuccess: boolean, tooltip: string): void {
		if (!isSuccess) return;

		const spanStatus = container.appendChild(document.createElement("span"));
		spanStatus.textContent = "✓";
		spanStatus.title = tooltip;
		spanStatus.classList.add("highlight", "bold", "status-icon");
	}

	#renderQuestion(itemContainer: HTMLElement, activity: StackOverflowQuestionActivity): void {
		const { title, score, tags, isAnswered, body, url } = activity;

		const details = itemContainer.appendChild(document.createElement("details"));
		details.classList.add("stack-overflow");

		// Summary: "Asked about [Tag]: [Title]"
		const summary = details.appendChild(document.createElement("summary"));

		summary.appendChild(DOMBuilder.newText("Asked "));
		if (tags.length > 0) {
			summary.appendChild(DOMBuilder.newText("about "));
			const codeTag = summary.appendChild(document.createElement("code"));
			codeTag.textContent = tags[0]; // Show main context only to keep it human-readable
			summary.appendChild(DOMBuilder.newText(": "));
		} else {
			summary.appendChild(DOMBuilder.newText(": "));
		}

		const strongTitle = summary.appendChild(document.createElement("strong"));
		strongTitle.textContent = title;

		this.#renderStatus(summary, isAnswered, "Question answered");

		if (score !== 0) {
			const spanScore = summary.appendChild(document.createElement("span"));
			spanScore.textContent = ` (${score > 0 ? "+" : ""}${score})`;
			spanScore.classList.add("description", "faded-score");
		}

		// Content
		const divContent = details.appendChild(document.createElement("div"));
		divContent.classList.add("stack-overflow-content", "flex", "column", "with-gap");

		// Link as a header inside content
		const headerLink = divContent.appendChild(DOMBuilder.newLink(title, new URL(url)));
		headerLink.classList.add("content-header");

		const divBody = divContent.appendChild(document.createElement("div"));
		divBody.innerHTML = body;
		divBody.classList.add("markup");
	}

	#renderAnswer(itemContainer: HTMLElement, activity: StackOverflowAnswerActivity): void {
		const { title, score, isAccepted, body, url } = activity;

		const details = itemContainer.appendChild(document.createElement("details"));
		details.classList.add("stack-overflow");

		// Summary: "Posted an answer to: [Title]"
		const summary = details.appendChild(document.createElement("summary"));

		summary.appendChild(DOMBuilder.newText("Posted an answer to: "));

		const strongTitle = summary.appendChild(document.createElement("strong"));
		strongTitle.textContent = title;

		this.#renderStatus(summary, isAccepted, "Answer accepted");

		if (score !== 0) {
			const spanScore = summary.appendChild(document.createElement("span"));
			spanScore.textContent = ` (${score > 0 ? "+" : ""}${score})`;
			spanScore.classList.add("description", "faded-score");
		}

		// Content
		const divContent = details.appendChild(document.createElement("div"));
		divContent.classList.add("stack-overflow-content", "flex", "column", "with-gap");

		// Link as a header inside content
		const headerLink = divContent.appendChild(DOMBuilder.newLink(title, new URL(url)));
		headerLink.classList.add("content-header");

		const divBody = divContent.appendChild(document.createElement("div"));
		divBody.innerHTML = body;
		divBody.classList.add("markup");
	}

	#renderSingle(itemContainer: HTMLElement, activity: StackOverflowActivity): void {
		if (activity instanceof StackOverflowQuestionActivity) return this.#renderQuestion(itemContainer, activity);
		if (activity instanceof StackOverflowAnswerActivity) return this.#renderAnswer(itemContainer, activity);
	}

	render(itemContainer: HTMLElement, buffer: readonly StackOverflowActivity[]): void {
		itemContainer.classList.add("flex", "column", "with-gap");
		// Removed the "Stack Overflow Activity" label as requested

		for (const activity of buffer) {
			this.#renderSingle(itemContainer, activity);
		}
	}
}
//#endregion
