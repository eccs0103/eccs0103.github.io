"use strict";

import "adaptive-extender/node";
import { type Promisable } from "adaptive-extender/node";
import FileSystem from "fs";
import AsyncFileSystem from "fs/promises";
import { glob } from "glob";
import { type InputOption, type OutputOptions, type PreserveEntrySignaturesOption, type RollupOptions } from "rollup";
import { defineConfig, type BuildEnvironmentOptions, type PluginOption, type UserConfig, type ViteDevServer } from "vite";

//#region Vite plugin
export class VitePlugin {
	#name: string;

	constructor(name: string) {
		if (new.target === VitePlugin) throw new TypeError("Unable to create an instance of an abstract class");
		this.#name = name;
	}

	writeBundle(): Promisable<void> {
		return Promise.resolve();
	}

	configureServer(server: ViteDevServer): Promisable<void> {
		void server;
	}

	build(): PluginOption {
		const name: string = this.#name;
		const writeBundle = this.writeBundle.bind(this);
		const configureServer = this.configureServer.bind(this);
		return { name, writeBundle, configureServer };
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
//#region Server routing plugin
export class ServerRoutingPlugin extends VitePlugin {
	#inputs: string[];
	#emergency: string;

	constructor(inputs: string[], emergency: string) {
		super("server-routing");
		this.#inputs = inputs;
		this.#emergency = emergency;
	}

	configureServer(server: ViteDevServer): void {
		const inputs = this.#inputs;
		const emergency = this.#emergency;

		server.middlewares.use(async (request, response, next) => {
			const { originalUrl, url, headers } = request;
			const { pathname } = new URL(originalUrl ?? url ?? "/", `http://${headers.host}`);
			const { accept } = headers;

			if (accept === undefined) return next();
			if (!accept.includes("text/html")) return next();

			if (!pathname.endsWith("/") && FileSystem.existsSync(`.${pathname}/index.html`)) {
				response.statusCode = 301;
				response.writeHead(301, { ["location"]: `${pathname}/` });
				response.end();
				return;
			}

			if (FileSystem.existsSync(`.${pathname}`)) return next();

			try {
				if (!FileSystem.existsSync(emergency)) throw new Error("404 page file missing");
				const content404 = await AsyncFileSystem.readFile(emergency, "utf-8");
				const html404 = await server.transformIndexHtml(pathname, content404);
				response.writeHead(404, { ["content-type"]: "text/html" });
				response.end(html404);
				return;
			} catch (reason) {
				console.error(Error.from(reason).toString());
				response.writeHead(404, { ["content-type"]: "text/plain" });
				response.end(`404: Page '${pathname}' not found`);
				return;
			}
		});
	}
}
//#endregion
//#region Default mirroring config
export class DefaultMirroringConfig extends ViteConfig {
	static #lock: boolean = true;

	constructor(inputs: string[], out: string, plugins: VitePlugin[]) {
		super(inputs, out, plugins);
		if (DefaultMirroringConfig.#lock) throw new TypeError("Illegal constructor");
	}

	static async construct(): Promise<DefaultMirroringConfig> {
		const out: string = "dist";
		
		const scripts = await glob("**/*.ts", { ignore: ["node_modules/**", "dist/**", "**/*.d.ts", "vite.config.ts", "tsconfig.json"] });
		const assets = await glob("**/*.*", { ignore: ["node_modules/**", "dist/**", "**/*.ts", "**/*.d.ts", "vite.config.ts", "tsconfig.json"], nodir: true });

		const copyPlugin = new CopyStaticAssetsPlugin(assets, out);
		const routingPlugin = new ServerRoutingPlugin(scripts, "404/index.html");

		DefaultMirroringConfig.#lock = false;
		const config = new DefaultMirroringConfig(scripts, out, [copyPlugin, routingPlugin]);
		DefaultMirroringConfig.#lock = true;
		return config;
	}
}
//#endregion

const config = await DefaultMirroringConfig.construct();
export default defineConfig(config.build());
