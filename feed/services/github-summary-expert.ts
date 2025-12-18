"use strict";

import { Random } from "adaptive-extender/web";
import { GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubDeleteActivity, GitHubDeleteBranchActivity, GitHubDeleteTagActivity, GitHubPushActivity, GitHubReleaseActivity, type GitHubActivity } from "../models/activity.js";
import { TextExpert } from "./text-expert.js";

const random = Random.global;

//#region Workflow report
enum ReportVibes {
	creation = "creation",
	milestone = "milestone",
	cleanup = "cleanup",
	focus = "focus",
	scattered = "scattered",
	chill = "chill"
}

class WorkflowReport {
	#vibe: ReportVibes;
	#primary: string;
	#secondary: string | undefined;
	#magnitude: number;
	#label: string;
	#modifier: string;
	#urls: Map<string, string>;

	constructor(vibe: ReportVibes, primary: string, secondary: string | undefined, magnitude: number, label: string, modifier: string, urls: Map<string, string>) {
		this.#vibe = vibe;
		this.#primary = primary;
		this.#secondary = secondary;
		this.#magnitude = magnitude;
		this.#label = label;
		this.#modifier = modifier;
		this.#urls = urls;
	}

	get vibe(): ReportVibes {
		return this.#vibe;
	}

	get primary(): string {
		return this.#primary;
	}

	get secondary(): string | undefined {
		return this.#secondary;
	}

	get magnitude(): number {
		return this.#magnitude;
	}

	get label(): string {
		return this.#label;
	}

	get modifier(): string {
		return this.#modifier;
	}

	get urls(): Map<string, string> {
		return this.#urls;
	}
}
//#endregion
//#region Summary context
export class SummaryContext {
	readonly #primary: Node | undefined;
	readonly #secondary: Node | undefined;
	readonly #magnitude: number;
	readonly #label: string;
	readonly #modifier: string;

	constructor(primary: Node | undefined, secondary: Node | undefined, magnitude: number, label: string, modifier: string) {
		this.#primary = primary;
		this.#secondary = secondary;
		this.#magnitude = magnitude;
		this.#label = label;
		this.#modifier = modifier;
	}

	get primary(): Node {
		return ReferenceError.suppress(this.#primary, "Primary repository is missing");
	}

	get secondary(): Node {
		return ReferenceError.suppress(this.#secondary, "Secondary repository is missing");
	}

	get magnitude(): number {
		return this.#magnitude;
	}

	get label(): string {
		return this.#label;
	}

	get modifier(): string {
		return this.#modifier;
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
			(print, { primary, label, modifier }) => print`Shipped a new ${modifier} ${label} for ${primary}.`,
			(print, { primary, label }) => print`Reached a major checkpoint in ${primary}: ${label}.`,
			(print, { primary, label }) => print`Stamped ${label} on ${primary} history.`,
			(print, { primary, modifier }) => print`Deployed fresh ${modifier} to ${primary}.`
		]],
		[ReportVibes.cleanup, [
			(print, { primary }) => print`Did some housekeeping in ${primary}.`,
			(print, { primary, modifier }) => print`Cleaned up ${modifier} in ${primary}.`,
			(print, { primary, magnitude }) => print`Swept the floor in ${primary}, removing ${magnitude} old references.`,
			(print, { primary }) => print`Tidied up the workspace in ${primary}.`
		]],
		[ReportVibes.focus, [
			(print, { primary, magnitude }) => print`Locked in on ${primary}. A massive stack of ${magnitude} updates.`,
			(print, { primary, magnitude }) => print`Went deep into ${primary}. Pushed ${magnitude} commits in a row.`,
			(print, { primary }) => print`Heavy coding session on ${primary}. Things are moving fast.`,
			(print, { primary }) => print`In the zone with ${primary}. Serious progress made.`,
			(print, { primary }) => print`Crushing tickets and pushing code to ${primary}.`
		]],
		[ReportVibes.scattered, [
			(print, { primary, secondary }) => print`Full-stack mode: switching context between ${primary} and ${secondary}.`,
			(print, { primary, secondary }) => print`Juggling updates across ${primary}, ${secondary} and more.`,
			(print, { primary }) => print`Bouncing between ${primary} and the rest of the ecosystem.`,
			(print, { primary, modifier }) => print`Keeping the momentum going across ${primary} and ${modifier}.`,
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

	#report: WorkflowReport;

	constructor(activities: readonly GitHubActivity[]) {
		this.#report = GitHubSummaryExpert.#analyze(activities);
	}

	static #analyze(activities: readonly GitHubActivity[]): WorkflowReport {
		const urls: Map<string, string> = new Map();
		const usage: Map<string, number> = new Map();
		let pushes: number = 0;
		let creations: number = 0;
		let releases: number = 0;
		let deletions: number = 0;
		let label: string = "new version";
		let modifier: string = "updates";
		let hasBranchDeletions = false;
		let hasTagDeletions = false;

		for (const activity of activities) {
			if (!urls.has(activity.repository)) urls.set(activity.repository, activity.url);
			const count = usage.get(activity.repository) ?? 0;
			usage.set(activity.repository, count + 1);

			if (activity instanceof GitHubPushActivity) {
				pushes++;
			}
			if (activity instanceof GitHubCreateRepositoryActivity) {
				creations++;
			}
			if (activity instanceof GitHubCreateTagActivity && releases === 0) {
				releases++;
				label = activity.name;
				modifier = "milestone";
			}
			if (activity instanceof GitHubReleaseActivity) {
				releases++;
				label = activity.title;
				modifier = activity.isPrerelease ? "beta" : "update";
			}
			if (activity instanceof GitHubDeleteBranchActivity) {
				deletions++;
				hasBranchDeletions = true;
			}
			if (activity instanceof GitHubDeleteTagActivity) {
				deletions++;
				hasTagDeletions = true;
			}
		}

		if (deletions > 0) {
			if (hasBranchDeletions && !hasTagDeletions) modifier = "old drafts";
			else if (hasTagDeletions && !hasBranchDeletions) modifier = "unused versions";
			else modifier = "stale data";
		}

		const repositories = Array
			.from(usage)
			.sort(([, count1], [, count2]) => count2 - count1)
			.map(([name]) => name);
		const primary = repositories[0];
		const total = activities.length;

		if (releases > 0) {
			return new WorkflowReport(ReportVibes.milestone, primary, undefined, releases, label, modifier, urls);
		}
		if (creations > 0) {
			return new WorkflowReport(ReportVibes.creation, primary, undefined, creations, "new project", "experiment", urls);
		}
		if (deletions > 0 && (deletions > total / 3 || total === deletions)) {
			return new WorkflowReport(ReportVibes.cleanup, primary, undefined, deletions, "cleanup", modifier, urls);
		}
		if (repositories.length > 1) {
			const others = repositories.length - 1;
			return new WorkflowReport(ReportVibes.scattered, primary, repositories.at(1), total, "ecosystem", `${others} other project${TextExpert.getPluralSuffix(others)}`, urls);
		}
		if (total >= 8) {
			return new WorkflowReport(ReportVibes.focus, primary, undefined, pushes, "updates", "stack", urls);
		}
		return new WorkflowReport(ReportVibes.chill, primary, undefined, total, "fixes", "minor", urls);
	}

	build(linker: LinkerFunction): SummaryContext {
		const { primary, secondary, magnitude, label, modifier, urls } = this.#report;
		const nodePrimary = Reflect.mapUndefined(primary, primary => linker(primary, ReferenceError.suppress(urls.get(primary))));
		const nodeSecondary = Reflect.mapUndefined(secondary, secondary => linker(secondary, ReferenceError.suppress(urls.get(secondary))));
		return new SummaryContext(nodePrimary, nodeSecondary, magnitude, label, modifier);
	}

	choose(): TemplateRenderer {
		const { vibe } = this.#report;
		const templates = ReferenceError.suppress(GitHubSummaryExpert.#templates.get(vibe));
		return random.item(templates);
	}
}
//#endregion
