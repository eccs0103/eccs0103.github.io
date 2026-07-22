"use strict";

import "adaptive-extender/node";
import { ActivityWalker } from "./activity-walker.js";
import { NpmPackument, NpmSearchResult } from "../models/npm-event.js";
import { Activity, NpmPublishActivity } from "../models/activity.js";

//#region Npm walker
export class NpmWalker extends ActivityWalker {
	#username: string;

	constructor(username: string) {
		super("NPM");
		this.#username = username;
	}

	async #fetchPackageNames(): Promise<string[]> {
		const url = new URL("https://registry.npmjs.org/-/v1/search");
		url.searchParams.set("text", `maintainer:${this.#username}`);
		url.searchParams.set("size", "250");
		const response = await fetch(url);
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const result = NpmSearchResult.import(await response.json(), "npm_search_result");
		return result.objects.map(({ package: item }) => item.name);
	}

	async #fetchPackument(name: string): Promise<NpmPackument> {
		const url = new URL(`https://registry.npmjs.org/${name}`);
		const response = await fetch(url);
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		return NpmPackument.import(await response.json(), "npm_packument");
	}

	async *crawl(since: Date): AsyncIterable<Activity> {
		const platform = this.name;
		const names = await this.#fetchPackageNames();
		for (const name of names) {
			try {
				const packument = await this.#fetchPackument(name);
				const { description: packageDescription, time, versions } = packument;
				for (const [version, published] of time) {
					if (version === "created" || version === "modified") continue;
					const timestamp = new Date(published);
					if (timestamp < since) continue;
					const details = versions.get(version);
					const description = details !== undefined ? details.description : packageDescription;
					const url = `https://www.npmjs.com/package/${name}/v/${version}`;
					yield new NpmPublishActivity(platform, timestamp, name, version, description, url);
				}
			} catch (reason) {
				console.error(reason);
			}
		}
	}
}
//#endregion
