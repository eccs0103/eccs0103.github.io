"use strict";

import { defineConfig } from "vite";
import { type ViteConfig } from "./environment/configs/vite-config.js";
import { DefaultMPAConfig } from "./environment/configs/default-mpa-config.js";
import { CloudflareVitePlugin } from "./environment/plugins/cloudflare-vite-plugin.js";
import { type VitePlugin } from "./environment/plugins/vite-plugin.js";

const root: URL = new URL(import.meta.url);
const inputs: URL[] = [
	new URL("./feed/index.html", root),
	new URL("./shortcuts/vscode-quartz/index.html", root),
	new URL("./applications/209-birthdays/index.html", root),
];
const rootEntries: URL[] = [];
const pathEntries: URL[] = [];
const output: URL = new URL("./dist", root);
const plugins: VitePlugin[] = [new CloudflareVitePlugin()];
const config: ViteConfig = await DefaultMPAConfig.construct(inputs, rootEntries, pathEntries, output, plugins);
export default defineConfig(config.build());
