"use strict";

import "adaptive-extender/core";
import { Any, ArrayOf, Field, Model, Optional, UnixSeconds } from "adaptive-extender/core";

//#region Stack overflow owner
export interface StackOverflowOwnerScheme {
	reputation?: number; /** Репутация пользователя. Осутствует, если user_type = "does_not_exist" */
	user_id?: number; /** ID пользователя. */
	user_type: string; // "registered" | "unregistered" | "does_not_exist"; /** Тип аккаунта. Влияет на наличие других полей. */
	display_name?: string; /** Имя, отображаемое в профиле. */
	link?: string; /** Ссылка на профиль на сайте. */
	profile_image?: string; /** Ссылка на аватар. */
}

export class StackOverflowOwner extends Model {
	@Field(Optional(Number), "reputation")
	reputation: number | undefined;

	@Field(Optional(Number), "user_id")
	userId: number | undefined;

	@Field(String, "user_type")
	userType: string;

	@Field(Optional(String), "display_name")
	displayName: string | undefined;

	@Field(Optional(String), "link")
	link: string | undefined;

	@Field(Optional(String), "profile_image")
	profileImage: string | undefined;
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

export class StackOverflowQuestion extends Model {
	@Field(ArrayOf(String), "tags")
	tags: string[];

	@Field(StackOverflowOwner, "owner")
	owner: StackOverflowOwner;

	@Field(Number, "score")
	score: number;

	@Field(UnixSeconds, "creation_date")
	creationDate: Date;

	@Field(Number, "question_id")
	questionId: number;

	@Field(String, "link")
	link: string;

	@Field(String, "title")
	title: string;

	@Field(Number, "view_count")
	viewCount: number;

	@Field(Number, "answer_count")
	answerCount: number;

	@Field(Boolean, "is_answered")
	isAnswered: boolean;

	@Field(String, "body")
	body: string;
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

export class StackOverflowAnswer extends Model {
	@Field(StackOverflowOwner, "owner")
	owner: StackOverflowOwner;

	@Field(Boolean, "is_accepted")
	isAccepted: boolean;

	@Field(Number, "score")
	score: number;

	@Field(UnixSeconds, "creation_date")
	creationDate: Date;

	@Field(Number, "answer_id")
	answerId: number;

	@Field(Number, "question_id")
	questionId: number;

	@Field(String, "link")
	link: string;

	@Field(String, "title")
	title: string;

	@Field(String, "body")
	body: string;
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

export class StackExchangeResponse extends Model {
	@Field(ArrayOf(Any), "items")
	items: any[];

	@Field(Boolean, "has_more")
	hasMore: boolean;

	@Field(Number, "quota_remaining")
	quotaRemaining: number;

	@Field(Number, "quota_max")
	quotaMax: number;

	@Field(Optional(Number), "backoff")
	backoff: number | undefined;
}
//#endregion
