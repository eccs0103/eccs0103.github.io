"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { StackExchangeResponse, IStackOverflowAnswerItem, IStackOverflowQuestionItem } from "../models/stack-overflow-event.js";
import { Activity, StackOverflowActivity } from "../models/activity.js";

export class StackOverflowWalker extends ActivityWalker {
	#userId: string;

	constructor(userId: string) {
		super("Stack overflow");
		this.#userId = userId;
	}

	async *#fetchPaginated(endpoint: string, params: Record<string, string>): AsyncIterable<any> {
		let page = 1;
		while (true) {
			const url = new URL(`https://api.stackexchange.com/2.3/users/${this.#userId}/${endpoint}`);
			url.searchParams.set("site", "ru.stackoverflow");
			url.searchParams.set("order", "desc");
			url.searchParams.set("sort", "creation");
			url.searchParams.set("pagesize", "100");
			url.searchParams.set("page", String(page));
			for (const [key, value] of Object.entries(params)) {
				url.searchParams.set(key, value);
			}
			const response = await fetch(url);
			if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
			const data = StackExchangeResponse.import(await response.json(), "stack_overflow_response");
			yield* data.items;
			// break
			page++;
		}
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		// Тянем все ответы и вопросы до даты since
		const [answers, questions] = await Promise.all([
			this.#fetchPaginated("answers", since, { filter: "!nNPvSNPHlk" }),
			this.#fetchPaginated("questions", since)
		]);

		// Сливаем, фильтруем по дате (на всякий случай) и сортируем
		const all = [
			...answers.map(i => ({ ...i, activityType: "answer" as const })),
			...questions.map(i => ({ ...i, activityType: "question" as const }))
		]
			.filter(item => new Date(item.creation_date * 1000) >= since)
			.sort((a, b) => b.creation_date - a.creation_date);

		for (const item of all) {
			const date = new Date(item.creation_date * 1000);
			const title = item.title || "Untitled";

			yield new StackOverflowActivity(
				this.name,
				date,
				title,
				item.score,
				item.activityType === "answer" ? (item as IStackOverflowAnswerItem).is_accepted : false,
				item.activityType,
				(item as IStackOverflowQuestionItem).tags || [],
				item.link
			);
		}
	}
}
