"use strict";

import "adaptive-extender/web";
import { Random } from "adaptive-extender/web";

//#region Group
export interface GroupMember {
	get name(): string;
	get surname(): string;
	get patronymic(): string;
	get birthday(): Date;
	askWish(): [GroupMember, string] | null;
	askWishes(): Generator<[GroupMember, string], null>;
	toWish(addressee: GroupMember, content: string): void;
	setImportanceFrom(member: GroupMember, importance: number): void;
}

export interface GroupMemberConstructor {
	new(name: string, surname: string, patronymic: string, birthday: Date): GroupMember;
	import(source: any, name?: string): GroupMember;
}

export class Group {
	//#region Member
	static #Member: GroupMemberConstructor = class Member implements GroupMember {
		#name: string;
		#surname: string;
		#patronymic: string;
		#birthday: number;
		#wishes: Map<GroupMember, string>;
		#importance: Map<GroupMember, number>;

		constructor(name: string, surname: string, patronymic: string, birthday: Date) {
			if (Group.#lockMember) throw new TypeError("Illegal constructor");
			this.#name = name;
			this.#surname = surname;
			this.#patronymic = patronymic;
			this.#birthday = Number(birthday);
			this.#wishes = new Map();
			this.#importance = new Map();
		}

		static import(source: any, name: string): GroupMember {
			const object = Object.import(source, name);
			const $name = String.import(Reflect.get(object, "name"), `${name}.name`);
			const surname = String.import(Reflect.get(object, "surname"), `${name}.surname`);
			const patronymic = String.import(Reflect.get(object, "patronymic"), `${name}.patronymic`);
			const birthday = new Date(String.import(Reflect.get(object, "birthday"), `${name}.birthday`));
			return Group.#newMember($name, surname, patronymic, birthday);
		}

		get name(): string {
			return this.#name;
		}

		get surname(): string {
			return this.#surname;
		}

		get patronymic(): string {
			return this.#patronymic;
		}

		get birthday(): Date {
			return new Date(this.#birthday);
		}

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

		toWish(addressee: Member, content: string): void {
			addressee.#wishes.set(this, content);
		}

		setImportanceFrom(member: GroupMember, importance: number): void {
			if (!this.#wishes.has(member)) throw new ReferenceError("Unable to set importance for the non-existing wish");
			this.#importance.set(member, importance);
		}
	};
	static get Member(): GroupMemberConstructor {
		return this.#Member;
	}

	static #lockMember: boolean = true;
	static #newMember(name: string, surname: string, patronymic: string, birthday: Date): GroupMember {
		Group.#lockMember = false;
		const self = new Group.Member(name, surname, patronymic, birthday);
		Group.#lockMember = true;
		return self;
	}
	//#endregion

	#name: string;
	#identifiers: Map<number, GroupMember>;
	#members: Map<GroupMember, number>;

	constructor(name: string) {
		this.#name = name;
		this.#identifiers = new Map();
		this.#members = new Map();
	}

	static import(source: any, name: string): Group {
		const object = Object.import(source, name);
		const group = new Group("209");
		const identifiers = group.#identifiers;
		const members = group.#members;
		Array.import(Reflect.get(object, "members"), `${name}.members`).forEach((row, index) => {
			const identifier = Number.import(Reflect.get(row, "identifier"), `${name}.members[${index}].identifier`);
			const member = Group.Member.import(row, `${name}.measures[${index}]`);
			identifiers.set(identifier, member);
			members.set(member, identifier);
		});
		Array.import(Reflect.get(object, "wishes"), `${name}.wishes`).forEach((row, index) => {
			const identifier1 = Number.import(Reflect.get(row, "member"), `${name}.wishes[${index}].member`);
			const identifier2 = Number.import(Reflect.get(row, "addressee"), `${name}.wishes[${index}].addressee`);
			const content = String.import(Reflect.get(row, "content"), `${name}.wishes[${index}].content`);
			const importance = Number.import(Reflect.get(row, "importance"), `${name}.wishes[${index}].importance`);
			const member = ReferenceError.suppress(identifiers.get(identifier1), `Member with identifier '${identifier1}' not registered in this group`);
			const addressee = ReferenceError.suppress(identifiers.get(identifier2), `Member with identifier '${identifier2}' not registered in this group`);
			member.toWish(addressee, content);
			addressee.setImportanceFrom(member, importance);
		});
		return group;
	}

	get name(): string {
		return this.#name;
	}

	get members(): GroupMember[] {
		return Array.from(this.#members.keys());
	}

	register(name: string, surname: string, patronymic: string, birthday: Date): GroupMember {
		const identifiers = this.#identifiers;
		const members = this.#members;
		const identifier = identifiers.size;
		const member = Group.#newMember(name, surname, patronymic, birthday);
		identifiers.set(identifier, member);
		members.set(member, identifier);
		return member;
	}
}
//#endregion
