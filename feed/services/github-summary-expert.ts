"use strict";

import { Random } from "adaptive-extender/web";
import { GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubPushActivity, type GitHubActivity } from "../models/activity.js";
import { TextExpert } from "./text-expert.js";

const random = Random.global;

//#region Summary context
export class SummaryContext {
	#primary: Node | undefined;
	#secondary: Node | undefined;
	#pushes: number;
	#projects: number;

	constructor(primary: Node | undefined, secondary: Node | undefined, pushes: number, projects: number) {
		this.#primary = primary;
		this.#secondary = secondary;
		this.#pushes = pushes;
		this.#projects = projects;
	}

	get primary(): Node {
		return ReferenceError.suppress(this.#primary, "Primary repository is not provided");
	}

	get secondary(): Node {
		return ReferenceError.suppress(this.#secondary, "Secondary repository is not provided");
	}

	get pushes(): number {
		return this.#pushes;
	}

	get projects(): number {
		return this.#projects;
	}
}
//#endregion
//#region GitHub summary expert
export interface PrinterFunction {
	(strings: TemplateStringsArray, ...values: any[]): void;
}

export interface LinkerFunction {
	(text: string, url: string): Node;
}

interface WorkflowReport {
	activities: number;
	pushes: number;
	creations: number;
	tags: number;
	repositories: string[];
	urls: Map<string, string>;
	primary?: string;
	secondary?: string;
}

enum ReportVibes {
	creation = "creation",
	milestone = "milestone",
	focus = "focus",
	scattered = "scattered",
	chill = "chill"
}

export interface TemplateRenderer {
	(printer: PrinterFunction, context: SummaryContext): void;
}

export class GitHubSummaryExpert {
	static #templates: Map<ReportVibes, TemplateRenderer[]> = new Map([
		[ReportVibes.creation, [
			(print, { primary }) => print`Cooked up a brand new experiment called ${primary}.`,
			(print, { primary }) => print`Initiated ${primary}. The start of something interesting.`,
			(print, { primary }) => print`Kicked off ${primary}. Let's see where this goes.`,
			(print, { primary }) => print`Dropped the first files for ${primary}.`
		]],
		[ReportVibes.milestone, [
			(print, { primary }) => print`Tagged a new version in ${primary}.`,
			(print, { primary }) => print`Reached a checkpoint in ${primary} and created a tag.`,
			(print, { primary }) => print`Stamped a new tag on ${primary}.`,
			(print, { primary }) => print`Marked a specific point in ${primary} history.`
		]],
		[ReportVibes.focus, [
			(print, { primary }) => print`Locked in on ${primary}. A massive stack of updates.`,
			(print, { primary, pushes }) => print`Went deep into ${primary}. Pushed ${pushes} commits in a row.`,
			(print, { primary }) => print`Heavy coding session on ${primary}. Things are moving fast.`,
			(print, { primary }) => print`In the zone with ${primary}. Serious progress made.`,
			(print, { primary }) => print`Crushing tickets and pushing code to ${primary}.`
		]],
		[ReportVibes.scattered, [
			(print, { primary, secondary }) => print`Full-stack mode: switching context between ${primary} and ${secondary}.`,
			(print, { primary, secondary }) => print`Juggling updates across ${primary}, ${secondary} and more.`,
			(print, { primary }) => print`Bouncing between ${primary} and the rest of the ecosystem.`,
			(print, { primary, projects }) => print`Keeping the momentum going across ${primary} and ${projects - 1} other project${TextExpert.getPluralSuffix(projects - 1)}.`,
			(print, { primary }) => print`Syncing updates between ${primary} and other projects.`
		]],
		[ReportVibes.chill, [
			(print, { primary }) => print`Polishing some code in ${primary}.`,
			(print, { primary }) => print`Tinkering with ${primary}. Just keeping things tidy.`,
			(print, { primary }) => print`Dropped a couple of quick fixes to ${primary}.`,
			(print, { primary }) => print`Making minor adjustments to ${primary}.`,
			(print, { primary }) => print`Briefly visited ${primary} to push some updates.`
		]]
	]);

	readonly #report: WorkflowReport;

	constructor(activities: readonly GitHubActivity[]) {
		this.#report = GitHubSummaryExpert.#analyze(activities);
	}

	static #analyze(activities: readonly GitHubActivity[]): WorkflowReport {
		const usage: Map<string, number> = new Map();
		const urls: Map<string, string> = new Map();

		let pushes = 0;
		let creations = 0;
		let tags = 0;

		for (const activity of activities) {
			if (!urls.has(activity.repository)) urls.set(activity.repository, activity.url);
			const count = usage.get(activity.repository) ?? 0;
			usage.set(activity.repository, count + 1);
			if (activity instanceof GitHubPushActivity) pushes++;
			if (activity instanceof GitHubCreateRepositoryActivity) creations++;
			if (activity instanceof GitHubCreateTagActivity) tags++;
		}

		const repositories = Array
			.from(usage)
			.sort(([, count1], [, count2]) => count2 - count1)
			.map(([name]) => name);

		const primary = repositories.at(0);
		const secondary = repositories.at(1);

		return { activities: activities.length, pushes, creations, tags, repositories, urls, primary, secondary };
	}

	#getVibe(): ReportVibes {
		const { creations, tags, repositories, activities } = this.#report;
		if (creations > 0) return ReportVibes.creation;
		if (tags > 0) return ReportVibes.milestone;
		if (repositories.length > 1) return ReportVibes.scattered;
		if (repositories.length === 1 && activities >= 8) return ReportVibes.focus;
		return ReportVibes.chill;
	}

	build(linker: LinkerFunction): SummaryContext {
		const { pushes, repositories, urls, primary, secondary } = this.#report;
		const nodePrimary = Reflect.mapUndefined(primary, primary => linker(primary, ReferenceError.suppress(urls.get(primary))));
		const nodeSecondary = Reflect.mapUndefined(secondary, secondary => linker(secondary, ReferenceError.suppress(urls.get(secondary))));
		return new SummaryContext(nodePrimary, nodeSecondary, pushes, repositories.length);
	}

	choose(): TemplateRenderer {
		const vibe = this.#getVibe();
		const templates = ReferenceError.suppress(GitHubSummaryExpert.#templates.get(vibe), `Templates for vibe '${vibe}' missing`);
		return random.item(templates);
	}
}
//#endregion
