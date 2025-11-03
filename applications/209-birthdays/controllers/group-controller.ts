"use strict";

import "adaptive-extender/web";
import { Timespan, Controller } from "adaptive-extender/web";
import { type GroupService } from "../services/group-service.js";
import { type SettingsService } from "../services/settings-service.js";
import { type PickerView } from "../view/picker-view.js";
import { type GroupMember } from "../models/group.js";

const { trunc } = Math;

class GroupController extends Controller {
	#groupRepository: GroupService;
	#settingsRepository: SettingsService;
	#pickerView: PickerView;

	#members: GroupMember[] = [];
	#selectionIndex: number = 0;
	#memberSelection: GroupMember | null = null;

	constructor(groupRepository: GroupService, settingsRepository: SettingsService, pickerView: PickerView) {
		super();
		this.#groupRepository = groupRepository;
		this.#settingsRepository = settingsRepository;
		this.#pickerView = pickerView;
	}

	async #buildModel(): Promise<void> {
		const group = await this.#groupRepository.getGroup();
		this.#selectionIndex = this.#settingsRepository.loadSelection();
		this.#members = group.members
			.sort((member1, member2) => member1.birthday.getDate() - member2.birthday.getDate())
			.sort((member1, member2) => member1.birthday.getMonth() - member2.birthday.getMonth());
		this.#memberSelection = this.#members.at(this.#selectionIndex) ?? null;
	}

	#bindViewEvents(): void {
		this.#pickerView.addEventListener("initializelayout", this.#onInitializeLayout.bind(this));
		this.#pickerView.addEventListener("selectionchange", this.#onSelectionChange.bind(this));
		this.#pickerView.addEventListener("selectioncommit", this.#onSelectionCommit.bind(this));
		this.#pickerView.addEventListener("timertrigger", this.#onTimerTrigger.bind(this));
	}

	#updatePickerContainer(member: GroupMember | null, animate: boolean): void {

		this.#memberSelection = member;

		if (member === null) {
			return this.#pickerView.updateContent(String.empty, String.empty, false);
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
			return this.#pickerView.updateContent(content, member.name, animate, 5000);
		}

		const timespan = Timespan.fromValue(begin - now);
		const days = trunc(timespan.hours / 24);
		const hours = timespan.hours % 24;
		const { negativity, minutes, seconds } = timespan;
		return this.#pickerView.updateContent(`${negativity ? "Աнցավ" : "Մնաց"} ${days}օր ${hours}ժ․ ${minutes}ր․ ${seconds}վ․`, String.empty, false, 1000);
	}

	#onInitializeLayout(event: Event): void {
		const pair = this.#pickerView.findSavedSelection(this.#selectionIndex);
		this.#updatePickerContainer(pair?.[0] ?? null, false);
		this.#onSelectionCommit();
	}

	#onSelectionChange(event: CustomEvent): void {
		const { member } = event.detail;
		this.#updatePickerContainer(member, false);
	}

	#onSelectionCommit(): void {
		const memberSelection = this.#memberSelection;
		if (memberSelection === null) return;

		const index = this.#members.indexOf(memberSelection);
		this.#settingsRepository.saveSelection(index);
	}

	#onTimerTrigger(): void {
		this.#updatePickerContainer(this.#memberSelection, true);
	}

	async run(): Promise<void> {
		await this.#buildModel();
		this.#pickerView.buildPickerItems(this.#members);
		this.#bindViewEvents();
		await this.#pickerView.initializeListeners();
	}
}

export { GroupController };
