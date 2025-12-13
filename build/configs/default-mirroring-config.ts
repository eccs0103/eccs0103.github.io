"use strict";

import "adaptive-extender/node";
import { glob } from "glob";
import { ViteConfig } from "./vite-config.js";
import { VitePlugin } from "../plugins/vite-plugin.js";
import { CopyStaticAssetsPlugin } from "../plugins/copy-assets-plugin.js";
import { ServerRoutingPlugin } from "../plugins/server-routing-plugin.js";

//#region Default mirroring config
export class DefaultMirroringConfig extends ViteConfig {
	static #lock: boolean = true;

	constructor(inputs: string[], out: string, plugins: VitePlugin[]) {
		super(inputs, out, plugins);
		if (DefaultMirroringConfig.#lock) throw new TypeError("Illegal constructor");
	}

	static async construct(root: URL): Promise<DefaultMirroringConfig> {
		const out: string = "dist";
		const ignore: string[] = [
			"node_modules/**",
			"dist/**",
			"**/*.d.ts",
			"build/**",
			"vite.config.ts",
			"tsconfig.json"
		];

		const scripts = await glob("**/*.ts", { ignore });
		const assets = await glob("**/*.*", { ignore: [...ignore, "**/*.ts"], nodir: true });
		const files = [...scripts, ...assets];

		const pluginCopy = new CopyStaticAssetsPlugin(root, assets, out);
		const pluginRouting = new ServerRoutingPlugin(files, "404/index.html");

		DefaultMirroringConfig.#lock = false;
		const config = new DefaultMirroringConfig(scripts, out, [pluginCopy, pluginRouting]);
		DefaultMirroringConfig.#lock = true;
		return config;
	}
}
//#endregion
