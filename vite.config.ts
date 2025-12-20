import { defineConfig } from "vite";
import { DefaultMPAConfig } from "./environment/configs/default-mpa-config.js";

const root = import.meta.url;
const inputs = [
	new URL("./index.html", root),
	new URL("./feed/index.html", root),
	new URL("./shortcuts/vscode-quartz/index.html", root),
	new URL("./applications/209-birthdays/index.html", root),
];
const output = new URL("./dist", root);
const config = await DefaultMPAConfig.construct(inputs, output);
export default defineConfig(config.build());
