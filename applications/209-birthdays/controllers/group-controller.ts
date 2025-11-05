"use strict";

import "adaptive-extender/web";
import { Timespan, Controller } from "adaptive-extender/web";
import { type GroupService } from "../services/group-service.js";
import { type SettingsService } from "../services/settings-service.js";
import { type PickerView } from "../view/picker-view.js";
import { Group, type GroupMember } from "../models/group.js";

//#region Group controller
class GroupController extends Controller {
	#serviceGroup: GroupService;
	#serviceSettings: SettingsService;
	#viewPicker: PickerView;

	#members: GroupMember[] = [];
	#indexSlection: number = 0;
	#memberSelection: GroupMember | null = null;

	constructor(serviceGroup: GroupService, serviceSettings: SettingsService, viewPicker: PickerView) {
		super();
		this.#serviceGroup = serviceGroup;
		this.#serviceSettings = serviceSettings;
		this.#viewPicker = viewPicker;
	}

	async #buildModel(): Promise<void> {
		const group = await this.#serviceGroup.readGroup();
		this.#members = group.members
			.sort((member1, member2) => member1.birthday.getDate() - member2.birthday.getDate())
			.sort((member1, member2) => member1.birthday.getMonth() - member2.birthday.getMonth());
		this.#indexSlection = this.#serviceSettings.readSelection();
		this.#memberSelection = this.#members.at(this.#indexSlection) ?? null;
	}

	#bindViewEvents(): void {
		this.#viewPicker.addEventListener("selectionchange", this.#onSelectionChange.bind(this));
		this.#viewPicker.addEventListener("selectioncommit", this.#onSelectionCommit.bind(this));
		this.#viewPicker.addEventListener("timertrigger", this.#onTimerTrigger.bind(this));
	}

	#updatePickerContainer(member: GroupMember | null, animate: boolean): void {
		this.#memberSelection = member;

		if (member === null) {
			return this.#viewPicker.updateContent(String.empty, String.empty, false);
		}

		const date = new Date();
		date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
		const now = Number(date);
		const { birthday } = member;
		const begin = birthday.setFullYear(date.getFullYear());
		const end = birthday.setDate(birthday.getDate() + 1);
		const wish = member.askWish();

		if (wish !== null) {
			const [member, content] = wish;
			return this.#viewPicker.updateContent(content, member.name, animate, 5000);
		}

		const timespan = Timespan.fromValue(begin - now);
		const { days, hours, minutes, seconds } = timespan.duration();
		const negativity = timespan.valueOf() < 0;
		return this.#viewPicker.updateContent(`${negativity ? "Աнցավ" : "Մնաց"} ${days}օր ${hours}ժ․ ${minutes}ր․ ${seconds}վ․`, String.empty, false, 1000);
	}

	#executeInitialLayout(): void {
		this.#viewPicker.setInitialSelection(this.#indexSlection);
		this.#updatePickerContainer(this.#memberSelection, false);
		this.#onSelectionCommit();
	}

	#onSelectionChange(event: CustomEvent<GroupMember | null>): void {
		this.#updatePickerContainer(event.detail, false);
	}

	#onSelectionCommit(): void {
		const memberSelection = this.#memberSelection;
		if (memberSelection === null) return;
		const index = this.#members.indexOf(memberSelection);
		this.#serviceSettings.writeSelection(index);
	}

	#onTimerTrigger(): void {
		this.#updatePickerContainer(this.#memberSelection, true);
	}

	async run(): Promise<void> {
		await this.#buildModel();
		this.#viewPicker.buildPickerItems(this.#members);
		this.#bindViewEvents();
		this.#viewPicker.initializeListeners();
		await Promise.asTimeout(1000);
		this.#executeInitialLayout();
	}
}
//#endregion

export { GroupController };