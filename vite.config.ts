"use strict";

import "adaptive-extender/node";
import { type Promisable } from "adaptive-extender/node";
import AsyncFileSystem from "fs/promises";
import { glob } from "glob";
import { type InputOption, type NormalizedOutputOptions, type OutputBundle, type OutputOptions, type PluginContext, type PreserveEntrySignaturesOption, type RollupOptions } from "rollup";
import { defineConfig, type BuildEnvironmentOptions, type PluginOption, type UserConfig } from "vite";


//#region Vite plugin
export class VitePlugin {
	#name: string;

	constructor(name: string) {
		if (new.target === VitePlugin) throw new TypeError("Unable to create an instance of an abstract class");
		this.#name = name;
	}

	writeBundle(): Promisable<void> {
	}

	build(): PluginOption {
		const name: string = this.#name;
		const writeBundle = this.writeBundle.bind(this);
		return { name, writeBundle };
	}
}
//#endregion

//#region Copy static assets plugin
export class CopyStaticAssetsPlugin extends VitePlugin {
	#inputs: string[];
	#out: string;

	constructor(inputs: string[], out: string) {
		super("copy-static-assets");
		this.#inputs = inputs;
		this.#out = out;
	}

	async writeBundle(): Promise<void> {
		const out = this.#out;
		await Promise.all(this.#inputs.map(async (file) => {
			const urlSource = new URL(file, import.meta.url);
			const urlDestination = new URL(`${out}/${file}`, import.meta.url);
			await AsyncFileSystem.mkdir(new URL(".", urlDestination), { recursive: true });
			if (!file.endsWith(".html")) {
				await AsyncFileSystem.copyFile(urlSource, urlDestination);
				return;
			}
			let content = await AsyncFileSystem.readFile(urlSource, "utf-8");
			content = content.replace(/src="(.*?)\.ts"/g, "src=\"$1.js\"");
			await AsyncFileSystem.writeFile(urlDestination, content);
		}));
	}
}
//#endregion

//#region Vite config
export class ViteConfig {
	#inputs: string[];
	#out: string;
	#plugins: VitePlugin[];

	constructor(inputs: string[], out: string, plugins: VitePlugin[]) {
		this.#inputs = inputs;
		this.#out = out;
		this.#plugins = plugins;
	}

	#buildInputOptions(): InputOption {
		return Object.fromEntries(this.#inputs.map(file => [file.replace(/\.ts$/, ""), file]));
	}

	#buildOutputOptions(): OutputOptions {
		const preserveModules: boolean = true;
		const preserveModulesRoot: string = ".";
		const entryFileNames: string = "[name].js";
		const assetFileNames: string = "[name].[ext]";
		const exports: "named" = "named";
		return { preserveModules, preserveModulesRoot, entryFileNames, assetFileNames, exports };
	}

	#buildRollupOptions(): RollupOptions {
		const preserveEntrySignatures: PreserveEntrySignaturesOption = "strict";
		const input: InputOption = this.#buildInputOptions();
		const output: OutputOptions = this.#buildOutputOptions();
		return { preserveEntrySignatures, input, output };
	}

	#buildEnviroment(): BuildEnvironmentOptions {
		const outDir: string = this.#out;
		const emptyOutDir: boolean = true;
		const minify: boolean = false;
		const sourcemap: boolean = false;
		const cssCodeSplit: boolean = false;
		const target: string = "ESNext";
		const rollupOptions: RollupOptions = this.#buildRollupOptions();
		return { outDir, emptyOutDir, minify, sourcemap, cssCodeSplit, target, rollupOptions };
	}

	build(): UserConfig {
		const root: string = ".";
		const base: string = "./";
		const build: BuildEnvironmentOptions = this.#buildEnviroment();
		const plugins: PluginOption[] = this.#plugins.map(plugin => plugin.build());
		return { root, base, build, plugins };
	}
}
//#endregion

const out: string = "dist";
const ignore: string[] = ["node_modules/**", "dist/**", "vite.config.ts", "**/*.d.ts"];
const copy = new CopyStaticAssetsPlugin(await glob(["**/*.*"], { ignore, nodir: true }), out);
const config = new ViteConfig(await glob("**/*.ts", { ignore }), out, [copy]);
export default defineConfig(config.build());
