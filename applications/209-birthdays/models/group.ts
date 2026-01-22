"use strict";

import "adaptive-extender/core";
import { ArrayOf, Field, Model } from "adaptive-extender/core";
import { Random } from "adaptive-extender/web";

//#region Group
export class GroupMember extends Model {
	@Field(Number, "identifier")
	identifier: number;

	@Field(String, "name")
	name: string;

	@Field(String, "surname")
	surname: string;

	@Field(String, "patronymic")
	patronymic: string;

	@Field(Date, "birthday")
	birthday: Date;

	#wishes: Map<GroupMember, string> = new Map();
	#importance: Map<GroupMember, number> = new Map();

	askWish(): [GroupMember, string] | null {
		const importance = this.#importance;
		if (importance.size === 0) return null;
		const random = Random.global;
		const addressee = random.case(importance);
		const wish = ReferenceError.suppress(this.#wishes.get(addressee), "Unable to ask for the non-existing wish");
		return [addressee, wish];
	}

	*askWishes(): Generator<[GroupMember, string], null> {
		const random = Random.global;
		const wishes = this.#wishes;
		let importance = new Map(this.#importance);
		while (true) {
			if (importance.size === 0) return null;
			const member = random.case(importance);
			const wish = ReferenceError.suppress(wishes.get(member), "Unable to ask for the non-existing wish");
			importance.delete(member);
			yield [member, wish];
			if (importance.size > 0) continue;
			importance = new Map(this.#importance);
		}
	}

	toWish(addressee: GroupMember, content: string): void {
		addressee.#wishes.set(this, content);
	}

	setImportanceFrom(member: GroupMember, importance: number): void {
		if (!this.#wishes.has(member)) throw new ReferenceError("Unable to set importance for the non-existing wish");
		this.#importance.set(member, importance);
	}
}

class Wish extends Model {
	@Field(Number, "member")
	member: number;

	@Field(Number, "addressee")
	addressee: number;

	@Field(String, "content")
	content: string;

	@Field(Number, "importance")
	importance: number;
}

export class Group extends Model {
	@Field(ArrayOf(GroupMember), "members")
	members: GroupMember[];

	@Field(ArrayOf(Wish), "wishes")
	wishes: Wish[];

	static load(source: any, name: string): Group {
		const group = super.import(source, name) as Group;

		const identifiers = new Map<number, GroupMember>();
		for (const member of group.members) identifiers.set(member.identifier, member);

		for (const wish of group.wishes) {
			const member = ReferenceError.suppress(identifiers.get(wish.member), `Member with identifier '${wish.member}' not registered in this group`);
			const addressee = ReferenceError.suppress(identifiers.get(wish.addressee), `Member with identifier '${wish.addressee}' not registered in this group`);

			member.toWish(addressee, wish.content);
			addressee.setImportanceFrom(member, wish.importance);
		}

		return group;
	}
}
//#endregion
