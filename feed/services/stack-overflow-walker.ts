"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { StackExchangeResponse, StackOverflowQuestion, StackOverflowAnswer } from "../models/stack-overflow-event.js";
import { Activity, StackOverflowAnswerActivity, StackOverflowQuestionActivity } from "../models/activity.js";

//#region Stack overflow walker
export class StackOverflowWalker extends ActivityWalker {
	#id: string;
	#apiKey: string;

	constructor(id: string, apiKey: string) {
		super("Stack overflow");
		this.#id = id;
		this.#apiKey = apiKey;
	}

	async *#fetchPaginated(endpoint: string): AsyncIterable<any> {
		let page = 1;
		while (true) {
			const url = new URL(`https://api.stackexchange.com/2.3/users/${this.#id}/${endpoint}`);
			url.searchParams.set("key", this.#apiKey);
			url.searchParams.set("site", "ru.stackoverflow");
			url.searchParams.set("order", "desc");
			url.searchParams.set("sort", "creation");
			url.searchParams.set("pagesize", "100");
			url.searchParams.set("page", String(page));
			url.searchParams.set("filter", "!)P9_qyD6XyHJLYKWY3jS6x.uxt2eB36b0OK2mkKT5P)M88undp-XHpcemjsoNQzGVtVO)*");
			const response = await fetch(url);
			if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
			const data = StackExchangeResponse.import(await response.json(), "stack_overflow_response");
			yield* data.items;
			if (!data.hasMore) break;
			page++;
		}
	}

	#decodeEntities(text: string): string {
		const entities: Record<string, string> = {
			"&quot;": "\"",
			"&amp;": "&",
			"&lt;": "<",
			"&gt;": ">",
			"&nbsp;": " ",
			"&#39;": "'"
		};
		return text.replace(/&[a-z0-9#]+;/gi, match => entities[match] ?? match);
	}

	async *#fetchQuestions(since: Date): AsyncIterable<StackOverflowQuestion> {
		let index = 0;
		for await (const item of this.#fetchPaginated("questions")) {
			try {
				const question = StackOverflowQuestion.import(item, `questions[${index++}]`);
				if (question.creationDate < since) return;
				yield question;
			} catch (reason) {
				console.error(reason);
			}
		}
	}

	async *#fetchAnswers(since: Date): AsyncIterable<StackOverflowAnswer> {
		let index = 0;
		for await (const item of this.#fetchPaginated("answers")) {
			try {
				const answer = StackOverflowAnswer.import(item, `answers[${index++}]`);
				if (answer.creationDate < since) return;
				yield answer;
			} catch (reason) {
				console.error(reason);
			}
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		const platform = this.name;
		for await (const answer of this.#fetchAnswers(since)) {
			const timestamp = answer.creationDate;
			const title = this.#decodeEntities(answer.title);
			const { body, score, isAccepted } = answer;
			const url = answer.link;
			yield new StackOverflowAnswerActivity(platform, timestamp, title, body, score, url, isAccepted);
		}
		for await (const question of this.#fetchQuestions(since)) {
			const timestamp = question.creationDate;
			const title = this.#decodeEntities(question.title);
			const { body, score, tags, isAnswered } = question;
			const url = question.link;
			const views = question.viewCount;
			yield new StackOverflowQuestionActivity(platform, timestamp, title, body, score, url, tags, views, isAnswered);
		}
	}
}
//#endregion
