"use strict";

import "adaptive-extender/node";
import AsyncFileSystem from "fs/promises";
import { VitePlugin } from "./vite-plugin.js";

//#region Copy static assets plugin
export class CopyStaticAssetsPlugin extends VitePlugin {
	static #patternTypescriptSource: RegExp = /src="(.*?)\.ts"/g;
	#root: URL;
	#inputs: string[];
	#out: string;

	constructor(root: URL, inputs: string[], out: string) {
		super("copy-static-assets");
		this.#root = root;
		this.#inputs = inputs;
		this.#out = out;
	}

	async writeBundle(): Promise<void> {
		const out = this.#out;
		const root = this.#root;
		await Promise.all(this.#inputs.map(async (file) => {
			const urlSource = new URL(file, root);
			const urlDestination = new URL(`${out}/${file}`, root);
			await AsyncFileSystem.mkdir(new URL(".", urlDestination), { recursive: true });
			if (!file.endsWith(".html")) {
				await AsyncFileSystem.copyFile(urlSource, urlDestination);
				return;
			}
			let content = await AsyncFileSystem.readFile(urlSource, "utf-8");
			content = content.replace(CopyStaticAssetsPlugin.#patternTypescriptSource, (_, part) => `src=\"${part}.js\"`);
			await AsyncFileSystem.writeFile(urlDestination, content);
		}));
	}
}
//#endregion
