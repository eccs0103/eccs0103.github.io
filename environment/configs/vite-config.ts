"use strict";

import "adaptive-extender/node";
import { type InputOption, type LogHandler, type OutputOptions, type PreserveEntrySignaturesOption, type RollupLog, type RollupOptions, type WarningHandlerWithDefault } from "rollup";
import { type BuildEnvironmentOptions, type PluginOption, type UserConfig } from "vite";
import { VitePlugin } from "../plugins/vite-plugin.js";

//#region Vite config
export class ViteConfig {
	static #patternTypescriptExtension: RegExp = /\.ts$/;
	#inputs: string[];
	#out: string;
	#plugins: VitePlugin[];

	constructor(inputs: string[], out: string, plugins: VitePlugin[]) {
		this.#inputs = inputs;
		this.#out = out;
		this.#plugins = plugins;
	}

	#buildInputOptions(): InputOption {
		return Object.fromEntries(this.#inputs.map(file => [file.replace(ViteConfig.#patternTypescriptExtension, String.empty), file]));
	}

	#buildOutputOptions(): OutputOptions {
		const preserveModules: boolean = true;
		const preserveModulesRoot: string = ".";
		const entryFileNames: string = "[name].js";
		const assetFileNames: string = "[name].[ext]";
		const exports: "named" = "named";
		return { preserveModules, preserveModulesRoot, entryFileNames, assetFileNames, exports };
	}

	#suppressExternalizationWarnings(warning: RollupLog, warn: LogHandler): void {
		if (warning.message.includes("externalized for browser compatibility")) return;
		warn("warn", warning);
	}

	#buildRollupOptions(): RollupOptions {
		const preserveEntrySignatures: PreserveEntrySignaturesOption = "strict";
		const input: InputOption = this.#buildInputOptions();
		const output: OutputOptions = this.#buildOutputOptions();
		const onwarn: WarningHandlerWithDefault = this.#suppressExternalizationWarnings.bind(this);
		return { preserveEntrySignatures, input, output, onwarn };
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
