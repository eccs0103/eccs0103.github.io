"use strict";

//#region Stack overflow owner
export interface StackOverflowOwnerScheme {
	reputation?: number; /** Репутация пользователя. Осутствует, если user_type = "does_not_exist" */
	user_id?: number; /** ID пользователя. */
	user_type: string; // "registered" | "unregistered" | "does_not_exist"; /** Тип аккаунта. Влияет на наличие других полей. */
	display_name?: string; /** Имя, отображаемое в профиле. */
	link?: string; /** Ссылка на профиль на сайте. */
	profile_image?: string; /** Ссылка на аватар. */
}

export class StackOverflowOwner {
	reputation: number | undefined;
	userId: number | undefined;
	userType: string;
	displayName: string | undefined;
	link: string | undefined;
	profileImage: string | undefined;

	constructor(reputation: number | undefined, userId: number | undefined, userType: string, displayName: string | undefined, link: string | undefined, profileImage: string | undefined) {
		this.reputation = reputation;
		this.userId = userId;
		this.userType = userType;
		this.displayName = displayName;
		this.link = link;
		this.profileImage = profileImage;
	}

	static import(source: any, name: string): StackOverflowOwner {
		const object = Object.import(source, name);
		const reputation = Reflect.mapUndefined(Reflect.get(object, "reputation") as unknown, reputation => Number.import(reputation, `${name}.reputation`));
		const userId = Reflect.mapUndefined(Reflect.get(object, "user_id") as unknown, userId => Number.import(userId, `${name}.user_id`));
		const userType = String.import(Reflect.get(object, "user_type"), `${name}.user_type`);
		const displayName = Reflect.mapUndefined(Reflect.get(object, "display_name") as unknown, displayName => String.import(displayName, `${name}.display_name`));
		const link = Reflect.mapUndefined(Reflect.get(object, "link") as unknown, link => String.import(link, `${name}.link`));
		const profileImage = Reflect.mapUndefined(Reflect.get(object, "profile_image") as unknown, profileImage => String.import(profileImage, `${name}.profile_image`));
		const result = new StackOverflowOwner(reputation, userId, userType, displayName, link, profileImage);
		return result;
	}

	static export(source: StackOverflowOwner): StackOverflowOwnerScheme {
		const reputation = source.reputation;
		const user_id = source.userId;
		const user_type = source.userType;
		const display_name = source.displayName;
		const link = source.link;
		const profile_image = source.profileImage;
		return { reputation, user_id, user_type, display_name, link, profile_image };
	}
}
//#endregion

//#region Stack overflow question
/**
 * Объект Вопроса (Question).
 * Документация: https://api.stackexchange.com/docs/types/question
 */
export interface StackOverflowQuestionScheme {
	tags: string[]; /** Массив тегов. */
	owner: StackOverflowOwnerScheme;
	score: number; /** Суммарный рейтинг вопроса. */
	creation_date: number; /** Дата создания (Unix Epoch Time в секундах). */
	question_id: number; /** Уникальный ID вопроса. */
	link: string; /** Ссылка на страницу вопроса. */
	title: string; /** Заголовок вопроса (HTML-encoded). */
	view_count: number; /** Количество просмотров. */
	answer_count: number; /** Количество ответов на этот вопрос. */
	is_answered: boolean; /** Принят ли какой-либо ответ на этот вопрос (не обязательно твой). */
	body: string; // <-- Добавлено поле body (HTML)
}

export class StackOverflowQuestion {
	tags: string[];
	owner: StackOverflowOwner;
	score: number;
	creationDate: Date;
	questionId: number;
	link: string;
	title: string;
	viewCount: number;
	answerCount: number;
	isAnswered: boolean;
	body: string;

	constructor(tags: string[], owner: StackOverflowOwner, score: number, creationDate: Date, questionId: number, link: string, title: string, viewCount: number, answerCount: number, isAnswered: boolean, body: string) {
		this.tags = tags;
		this.owner = owner;
		this.score = score;
		this.creationDate = creationDate;
		this.questionId = questionId;
		this.link = link;
		this.title = title;
		this.viewCount = viewCount;
		this.answerCount = answerCount;
		this.isAnswered = isAnswered;
		this.body = body;
	}

	static import(source: any, name: string): StackOverflowQuestion {
		const object = Object.import(source, name);
		const tags = Array.import(Reflect.get(object, "tags"), `${name}.tags`).map((item, index) => {
			return String.import(item, `${name}.tags[${index}]`);
		});
		const owner = StackOverflowOwner.import(Reflect.get(object, "owner"), `${name}.owner`);
		const score = Number.import(Reflect.get(object, "score"), `${name}.score`);
		const creationDate = new Date(Number.import(Reflect.get(object, "creation_date"), `${name}.creation_date`) * 1000);
		const questionId = Number.import(Reflect.get(object, "question_id"), `${name}.question_id`);
		const link = String.import(Reflect.get(object, "link"), `${name}.link`);
		const title = String.import(Reflect.get(object, "title"), `${name}.title`);
		const viewCount = Number.import(Reflect.get(object, "view_count"), `${name}.view_count`);
		const answerCount = Number.import(Reflect.get(object, "answer_count"), `${name}.answer_count`);
		const isAnswered = Boolean.import(Reflect.get(object, "is_answered"), `${name}.is_answered`);
		const body = String.import(Reflect.get(object, "body"), `${name}.body`);
		const result = new StackOverflowQuestion(tags, owner, score, creationDate, questionId, link, title, viewCount, answerCount, isAnswered, body);
		return result;
	}

	static export(source: StackOverflowQuestion): StackOverflowQuestionScheme {
		const tags = source.tags;
		const owner = StackOverflowOwner.export(source.owner);
		const score = source.score;
		const creation_date = Number(source.creationDate) / 1000;
		const question_id = source.questionId;
		const link = source.link;
		const title = source.title;
		const view_count = source.viewCount;
		const answer_count = source.answerCount;
		const is_answered = source.isAnswered;
		const body = source.body;
		return { tags, owner, score, creation_date, question_id, link, title, view_count, answer_count, is_answered, body };
	}
}
//#endregion

//#region Stack overflow answer
/**
 * Объект Ответа (Answer).
 * Документация: https://api.stackexchange.com/docs/types/answer
 */
export interface StackOverflowAnswerScheme {
	owner: StackOverflowOwnerScheme;
	is_accepted: boolean; /** True, если автор вопроса пометил этот ответ как решение. */
	score: number; /** Рейтинг ответа (upvotes - downvotes). */
	creation_date: number; /** Дата создания (Unix Epoch Time в секундах). */
	answer_id: number; /** Уникальный ID ответа. */
	question_id: number;/** ID вопроса, к которому относится ответ. */
	link: string;/** Прямая ссылка на ответ. */
	title: string; /** Заголовок вопроса. Появляется ТОЛЬКО при использовании фильтра !6WPIomplt */
	body: string; // <-- Добавлено поле body (HTML). Появляется ТОЛЬКО при использовании фильтра !6WPIomplt
}

export class StackOverflowAnswer {
	owner: StackOverflowOwner;
	isAccepted: boolean;
	score: number;
	creationDate: Date;
	answerId: number;
	questionId: number;
	link: string;
	title: string;
	body: string;

	constructor(owner: StackOverflowOwner, isAccepted: boolean, score: number, creationDate: Date, answerId: number, questionId: number, link: string, title: string, body: string) {
		this.owner = owner;
		this.isAccepted = isAccepted;
		this.score = score;
		this.creationDate = creationDate;
		this.answerId = answerId;
		this.questionId = questionId;
		this.link = link;
		this.title = title;
		this.body = body;
	}

	static import(source: any, name: string): StackOverflowAnswer {
		const object = Object.import(source, name);
		const owner = StackOverflowOwner.import(Reflect.get(object, "owner"), `${name}.owner`);
		const isAccepted = Boolean.import(Reflect.get(object, "is_accepted"), `${name}.is_accepted`);
		const score = Number.import(Reflect.get(object, "score"), `${name}.score`);
		const creationDate = new Date(Number.import(Reflect.get(object, "creation_date"), `${name}.creation_date`) * 1000);
		const answerId = Number.import(Reflect.get(object, "answer_id"), `${name}.answer_id`);
		const questionId = Number.import(Reflect.get(object, "question_id"), `${name}.question_id`);
		const link = String.import(Reflect.get(object, "link"), `${name}.link`);
		const title = String.import(Reflect.get(object, "title"), `${name}.title`);
		const body = String.import(Reflect.get(object, "body"), `${name}.body`);
		const result = new StackOverflowAnswer(owner, isAccepted, score, creationDate, answerId, questionId, link, title, body);
		return result;
	}

	static export(source: StackOverflowAnswer): StackOverflowAnswerScheme {
		const owner = StackOverflowOwner.export(source.owner);
		const is_accepted = source.isAccepted;
		const score = source.score;
		const creation_date = Number(source.creationDate) / 1000;
		const answer_id = source.answerId;
		const question_id = source.questionId;
		const link = source.link;
		const title = source.title;
		const body = source.body;
		return { owner, is_accepted, score, creation_date, answer_id, question_id, link, title, body };
	}
}
//#endregion

//#region Stack exchange response
/**
 * Обертка любого ответа от Stack Exchange API.
 */
export interface StackExchangeResponseScheme<T = any> {
	items: T[]; /** Список запрошенных объектов. */
	has_more: boolean; /** Указывает, есть ли еще данные на следующих страницах. */
	quota_remaining: number; /** Сколько запросов к API ты еще можешь сделать сегодня (обычно 300 без ключа, 10000 с ключом). */
	quota_max: number; /** Твой дневной лимит запросов. */
	backoff?: number; /** Время ожидания перед следующим запросом в секундах (приходит только при перегрузке). */
}

export class StackExchangeResponse {
	items: any[];
	hasMore: boolean;
	quotaRemaining: number;
	quotaMax: number;
	backoff: number | undefined;

	constructor(items: any[], hasMore: boolean, quotaRemaining: number, quotaMax: number, backoff: number | undefined) {
		this.items = items;
		this.hasMore = hasMore;
		this.quotaRemaining = quotaRemaining;
		this.quotaMax = quotaMax;
		this.backoff = backoff;
	}

	static import(source: any, name: string): StackExchangeResponse {
		const object = Object.import(source, name);
		const items = Array.import(Reflect.get(object, "items"), `${name}.items`);
		const hasMore = Boolean.import(Reflect.get(object, "has_more"), `${name}.has_more`);
		const quotaRemaining = Number.import(Reflect.get(object, "quota_remaining"), `${name}.quota_remaining`);
		const quotaMax = Number.import(Reflect.get(object, "quota_max"), `${name}.quota_max`);
		const backoff = Reflect.mapUndefined(Reflect.get(object, "backoff") as unknown, backoff => Number.import(backoff, `${name}.backoff`));
		const result = new StackExchangeResponse(items, hasMore, quotaRemaining, quotaMax, backoff);
		return result;
	}

	static export(source: StackExchangeResponse): StackExchangeResponseScheme {
		const items = source.items;
		const has_more = source.hasMore;
		const quota_remaining = source.quotaRemaining;
		const quota_max = source.quotaMax;
		const backoff = source.backoff;
		return { items, has_more, quota_remaining, quota_max, backoff };
	}
}
//#endregion
