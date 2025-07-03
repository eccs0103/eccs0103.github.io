"use strict";
import "../../scripts/dom/extensions.js";
import { ArchiveManager } from "../../scripts/dom/storage.js";
import { Random } from "../../scripts/core/generators.js";
import { Timespan } from "../../scripts/core/measures.js";
import { Timer } from "../../scripts/worker/measures.js";
const { trunc } = Math;
class Group {
    //#region Member
    static Member = class GroupMember {
        static import(source, name = "[source]") {
            const object = Object.import(source, name);
            const name2 = String.import(Reflect.get(object, "name"), `${name}.name`);
            const surname = String.import(Reflect.get(object, "surname"), `${name}.surname`);
            const patronymic = String.import(Reflect.get(object, "patronymic"), `${name}.patronymic`);
            const birthday = new Date(String.import(Reflect.get(object, "birthday"), `${name}.birthday`));
            return Group.#newMember(name2, surname, patronymic, birthday);
        }
        constructor(name, surname, patronymic, birthday) {
            if (Group.#lockMember)
                throw new TypeError("Illegal constructor");
            this.#name = name;
            this.#surname = surname;
            this.#patronymic = patronymic;
            this.#birthday = Number(birthday);
            this.#wishes = new Map();
            this.#importance = new Map();
        }
        #name;
        get name() {
            return this.#name;
        }
        #surname;
        get surname() {
            return this.#surname;
        }
        #patronymic;
        get patronymic() {
            return this.#patronymic;
        }
        #birthday;
        get birthday() {
            return new Date(this.#birthday);
        }
        #wishes;
        askWish() {
            const importance = this.#importance;
            if (importance.size === 0)
                return null;
            const random = Random.global;
            const addressee = random.case(importance);
            const wish = this.#wishes.get(addressee) ?? Error.throws("Unable to ask for the non-existing wish");
            return [addressee, wish];
        }
        toWish(addressee, content) {
            addressee.#wishes.set(this, content);
        }
        #importance;
        setImportanceFrom(addressee, importance) {
            if (!this.#wishes.has(addressee))
                throw new ReferenceError("Unable to set importance for the non-existing wish");
            this.#importance.set(addressee, importance);
        }
    };
    static #lockMember = true;
    static #newMember(name, surname, patronymic, birthday) {
        Group.#lockMember = false;
        const self = new Group.Member(name, surname, patronymic, birthday);
        Group.#lockMember = true;
        return self;
    }
    //#endregion
    static import(source, name = "[source]") {
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
            const identifier1 = Number.import(Reflect.get(row, "member"), `${name}.wishes[${index}].identifier`);
            const identifier2 = Number.import(Reflect.get(row, "addressee"), `${name}.wishes[${index}].addressee`);
            const content = String.import(Reflect.get(row, "content"), `${name}.wishes[${index}].content`);
            const importance = Number.import(Reflect.get(row, "importance"), `${name}.wishes[${index}].importance`);
            const member = identifiers.get(identifier1) ?? Error.throws(`Member with identifier '${identifier1}' not registered in this group`);
            const addressee = identifiers.get(identifier2) ?? Error.throws(`Member with identifier '${identifier2}' not registered in this group`);
            member.toWish(addressee, content);
            addressee.setImportanceFrom(member, importance);
        });
        return group;
    }
    constructor(name) {
        this.#name = name;
        this.#identifiers = new Map();
        this.#members = new Map();
    }
    #name;
    get name() {
        return this.#name;
    }
    #identifiers;
    #members;
    get members() {
        return Array.from(this.#members.keys());
    }
    register(name, surname, patronymic, birthday) {
        const identifiers = this.#identifiers;
        const members = this.#members;
        const identifier = identifiers.size;
        const member = Group.#newMember(name, surname, patronymic, birthday);
        identifiers.set(identifier, member);
        members.set(member, identifier);
        return member;
    }
}
class Settings {
    static import(source, name = "[source]") {
        const object = Object.import(source, name);
        const settings = new Settings();
        const selection = Reflect.get(object, "selection");
        if (selection !== undefined)
            settings.selection = Number.import(selection, `${name}.selection`);
        return settings;
    }
    export() {
        return {
            selection: this.selection,
        };
    }
    #selection = 0;
    get selection() {
        return this.#selection;
    }
    set selection(value) {
        this.#selection = value;
    }
}
//#endregion
//#region Controller
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity[AlertSeverity["ignore"] = 0] = "ignore";
    AlertSeverity[AlertSeverity["log"] = 1] = "log";
    AlertSeverity[AlertSeverity["throw"] = 2] = "throw";
})(AlertSeverity || (AlertSeverity = {}));
class Controller {
    //#region Internal
    static #locked = true;
    static async build() {
        Controller.#locked = false;
        const self = new Controller();
        Controller.#locked = true;
        try {
            await self.#main();
        }
        catch (reason) {
            await self.#catch(Error.from(reason));
        }
    }
    constructor() {
        if (Controller.#locked)
            throw new TypeError(`Illegal constructor`);
    }
    #severity = AlertSeverity.throw;
    async #catch(error) {
        switch (this.#severity) {
            case AlertSeverity.ignore: break;
            case AlertSeverity.log:
                {
                    console.error(error);
                }
                break;
            case AlertSeverity.throw:
                {
                    await window.alertAsync(error);
                    location.reload();
                }
                break;
        }
    }
    //#endregion
    //#region Model
    async #buildModel() {
        const response = await fetch("./database-2025.json");
        const object = await response.json();
        const group = Group.import(object);
        const members = this.#members = group.members
            .sort((member1, member2) => member1.birthday.getDate() - member2.birthday.getDate())
            .sort((member1, member2) => member1.birthday.getMonth() - member2.birthday.getMonth());
        const settings = this.#settings = (await ArchiveManager.construct(`${navigator.dataPath}.Settings`, Settings)).content;
        this.#memberSelection = members.at(settings.selection) ?? null;
    }
    #members;
    #settings;
    #memberSelection;
    #savePickerSelection() {
        const memberSelection = this.#memberSelection;
        if (memberSelection === null)
            return;
        const members = this.#members;
        const index = members.indexOf(memberSelection);
        if (index < 0)
            return;
        const settings = this.#settings;
        settings.selection = index;
    }
    //#endregion
    //#region View
    static #createPickerItem(member) {
        const buttonPickerItem = document.createElement("button");
        buttonPickerItem.type = "button";
        buttonPickerItem.title = String.empty;
        buttonPickerItem.classList.add("picker-item", "flex", "column", "primary-centered");
        const spanItemTitle = buttonPickerItem.appendChild(document.createElement("span"));
        spanItemTitle.classList.add("title");
        spanItemTitle.textContent = `${member.birthday.toLocaleDateString("hy", { month: "short", day: "numeric" })}`;
        const spanItemSubtitle = buttonPickerItem.appendChild(document.createElement("dfn"));
        spanItemSubtitle.classList.add("subtitle");
        spanItemSubtitle.textContent = `${member.name}`;
        return buttonPickerItem;
    }
    static #createAppearanceKeyframe(opacity, easing) {
        return { opacity, easing };
    }
    async #buildView() {
        const members = this.#members;
        const divScrollPicker = this.#divScrollPicker = document.getElement(HTMLDivElement, "div#scroll-picker");
        const pairMemberWithButton = this.#pairMemberWithButton = members.map(member => [member, divScrollPicker.appendChild(Controller.#createPickerItem(member))]);
        const h4SelectionTitle = this.#h4SelectionTitle = document.getElement(HTMLHeadingElement, "h4#selection-title");
        const dfnSelectionAuxiliary = this.#dfnSelectionAuxiliary = document.getElement(HTMLElement, "dfn#selection-auxiliary");
        const timer = this.#timer = new Timer(false);
    }
    #divScrollPicker;
    #pairMemberWithButton;
    #findPickerClosest() {
        const divScrollPicker = this.#divScrollPicker;
        const pairMemberWithButton = this.#pairMemberWithButton;
        const { y, height } = divScrollPicker.getBoundingClientRect();
        const center = y + height / 2;
        return pairMemberWithButton.find(([, buttonPickerItem]) => {
            const { y, height } = buttonPickerItem.getBoundingClientRect();
            return (y <= center && center < y + height);
        }) ?? null;
    }
    #findSavedSelection() {
        const pairMemberWithButton = this.#pairMemberWithButton;
        const settings = this.#settings;
        return pairMemberWithButton.at(settings.selection) ?? this.#findPickerClosest();
    }
    #buttonPickerSelection = null;
    #setPickerSelection(pair) {
        if (this.#buttonPickerSelection !== null)
            this.#buttonPickerSelection.classList.remove("selected");
        const [member, button] = pair ?? [null, null];
        this.#buttonPickerSelection = button;
        if (this.#buttonPickerSelection !== null)
            this.#buttonPickerSelection.classList.add("selected");
        this.#memberSelection = member;
    }
    #h4SelectionTitle;
    #dfnSelectionAuxiliary;
    #appearance = Controller.#createAppearanceKeyframe("1", "ease-out");
    #disappearance = Controller.#createAppearanceKeyframe("0", "ease-in");
    #duration = 500;
    #fill = "both";
    async #writeSelectionTitle(text, animate) {
        const h4SelectionTitle = this.#h4SelectionTitle;
        const disappearance = this.#disappearance;
        const appearance = this.#appearance;
        const duration = this.#duration;
        const fill = this.#fill;
        if (animate)
            await h4SelectionTitle.animate([appearance, disappearance], { duration, fill }).finished;
        h4SelectionTitle.textContent = text;
        if (animate)
            await h4SelectionTitle.animate([disappearance, appearance], { duration, fill }).finished;
    }
    async #writeSelectionAuxiliary(text, animate) {
        const dfnSelectionAuxiliary = this.#dfnSelectionAuxiliary;
        const disappearance = this.#disappearance;
        const appearance = this.#appearance;
        const duration = this.#duration;
        const fill = this.#fill;
        if (animate)
            await dfnSelectionAuxiliary.animate([appearance, disappearance], { duration, fill }).finished;
        dfnSelectionAuxiliary.textContent = text;
        if (animate)
            await dfnSelectionAuxiliary.animate([disappearance, appearance], { duration, fill }).finished;
    }
    #timer;
    #provideContainerLifecycle(text, author, animate, counter = 0) {
        const timer = this.#timer;
        this.#writeSelectionTitle(text, animate);
        this.#writeSelectionAuxiliary(author, animate);
        timer.setTimeout(counter);
    }
    #updatePickerContainer(animate) {
        const memberSelection = this.#memberSelection;
        if (memberSelection === null)
            return this.#provideContainerLifecycle(String.empty, String.empty, false);
        const date = new Date();
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        const now = Number(date);
        const { birthday } = memberSelection;
        const begin = birthday.setFullYear(date.getFullYear());
        const end = birthday.setDate(birthday.getDate() + 1);
        const wish = memberSelection.askWish();
        if (wish !== null) {
            const [addressee, content] = wish;
            return this.#provideContainerLifecycle(content, addressee.name, animate, 5000);
        }
        const timespan = Timespan.viaDuration(begin - now);
        const days = trunc(timespan.hours / 24);
        const hours = timespan.hours % 24;
        const { negativity, minutes, seconds } = timespan;
        return this.#provideContainerLifecycle(`${negativity ? "Անցավ" : "Մնաց"} ${days}օր ${hours}ժ․ ${minutes}ր․ ${seconds}վ․`, String.empty, false, 1000);
    }
    #updatePickerChange() {
        const buttonPickerSelection = this.#buttonPickerSelection;
        if (buttonPickerSelection === null)
            return;
        buttonPickerSelection.scrollIntoView({ behavior: "smooth", block: "center" });
        this.#savePickerSelection();
        this.#updatePickerContainer(false);
    }
    async #runViewInitialization() {
        const divScrollPicker = this.#divScrollPicker;
        const pairMemberWithButton = this.#pairMemberWithButton;
        const timer = this.#timer;
        await Promise.withTimeout(1000);
        this.#setPickerSelection(this.#findSavedSelection());
        this.#updatePickerChange();
        divScrollPicker.addEventListener("scroll", event => this.#setPickerSelection(this.#findPickerClosest()));
        divScrollPicker.addEventListener("scrollend", event => this.#updatePickerChange());
        window.addEventListener("resize", (event) => {
            this.#setPickerSelection(this.#findPickerClosest());
            this.#updatePickerChange();
        });
        for (const [member, buttonPickerItem] of pairMemberWithButton) {
            buttonPickerItem.addEventListener("click", (event) => {
                this.#setPickerSelection([member, buttonPickerItem]);
                this.#updatePickerChange();
            });
        }
        timer.addEventListener("trigger", event => this.#updatePickerContainer(true));
    }
    //#endregion
    async #main() {
        await this.#buildModel();
        await this.#buildView();
        await this.#runViewInitialization();
    }
}
//#endregion
Controller.build();
