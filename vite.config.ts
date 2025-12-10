"use strict";

import "adaptive-extender/node";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import AsyncFileSystem from "fs/promises";
import FileSystem from "fs";

const input: Record<string, string> = {
	["main"]: "index.html",
	["feed/index"]: "feed/index.html",
	["applications/209-birthdays/index"]: "applications/209-birthdays/index.html",
	["shortcuts/vscode-quartz/index"]: "shortcuts/vscode-quartz/index.html",
	// ["404/index"]: "404/index.html",
};

const routes: Set<string> = new Set(Object.keys(input).map((key) => {
	if (key === "main") return "/";
	return `/${key.replace(/\/index$/, String.empty)}/`;
}));

function collectStaticFiles(dir: string, baseDir: string = ""): { src: string; dest: string; }[] {
	const ignoreList = ["node_modules", "dist", ".git", ".vscode", ".idea", "types"];
	const results: { src: string; dest: string; }[] = [];

	try {
		const items = FileSystem.readdirSync(dir);

		for (const item of items) {
			if (ignoreList.includes(item)) continue;
			if (item === "vite.config.ts") continue;
			if (item === "tsconfig.json") continue;
			if (item.startsWith("package")) continue;
			if (item.startsWith(".")) continue;

			const fullPath = baseDir ? `${dir}/${item}` : item;
			const isDirectory = FileSystem.statSync(fullPath).isDirectory();

			if (isDirectory) {
				results.push(...collectStaticFiles(fullPath, fullPath));
			} else {
				const isViteFile = item.endsWith(".ts") || item.endsWith(".html");
				if (!isViteFile) {
					const destFolder = baseDir || ".";
					results.push({ src: fullPath, dest: destFolder });
				}
			}
		}
	} catch (e) {
		console.error(`Error scanning directory ${dir}:`, e);
	}

	return results;
}

export default defineConfig(({ command }) => {
	const isBuild = command === 'build';
	const copyTargets = collectStaticFiles(".");

	return {
		publicDir: false,
		base: "/",
		build: {
			outDir: "dist",
			emptyOutDir: true,
			modulePreload: { polyfill: false },
			rollupOptions: {
				preserveEntrySignatures: "strict",
				input,
				output: {
					preserveModules: true,
					entryFileNames: "[name].js",
					chunkFileNames: "chunks/[name].js",
					assetFileNames: "assets/[name][extname]",
				},
			},
		},
		plugins: [
			isBuild ? viteStaticCopy({
				targets: copyTargets
			}) : undefined,

			{
				name: "server-plugin",
				configureServer(server) {
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

						if (routes.has(pathname)) return next();
						try {
							if (!FileSystem.existsSync(input["404/index"])) throw new Error("404 page file missing");
							const content404 = await AsyncFileSystem.readFile(input["404/index"], "utf-8");
							const html404 = await server.transformIndexHtml(pathname, content404);
							response.writeHead(404, { ["content-type"]: "text/html" });
							response.end(html404);
							return;
						} catch (reason) {
							console.error(Error.from(reason).toString());
							response.writeHead(404, { ["content-type"]: "text/plain" });
							response.end("404: Page not found");
							return;
						}
					});
				},
			},
		],
	};
});
