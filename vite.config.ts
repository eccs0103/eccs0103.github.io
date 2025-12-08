"use strict";

import "adaptive-extender/node";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import FileSystemAsync from "fs/promises";
import FileSystem from "fs";

const meta = import.meta;
const root: string = fileURLToPath(new URL(".", meta.url));

const input: Record<string, string> = {
	["main"]: fileURLToPath(new URL("index.html", meta.url)),
	["feed/index"]: fileURLToPath(new URL("feed/index.html", meta.url)),
	["applications/209-birthdays/index"]: fileURLToPath(new URL("applications/209-birthdays/index.html", meta.url)),
	["shortcuts/vscode-quartz/index"]: fileURLToPath(new URL("shortcuts/vscode-quartz/index.html", meta.url)),
	// ["404/index"]: fileURLToPath(new URL("404/index.html", meta.url)),
};

const routes: Set<string> = new Set(Object.keys(input).map((key) => {
	if (key === "main") return "/";
	return `/${key.replace(/\/index$/, String.empty)}/`;
}));

export default defineConfig({
	root,
	publicDir: fileURLToPath(new URL("resources", meta.url)),
	base: "/",
	resolve: {
		alias: [
			{ find: "/resources", replacement: fileURLToPath(new URL("resources", meta.url)) },
		],
	},
	build: {
		outDir: "dist",
		rollupOptions: {
			input,
			output: {
				entryFileNames: "scripts/[name]-[hash].js",
				chunkFileNames: "scripts/chunks/[name]-[hash].js",
				assetFileNames({ names }): string {
					if (names.length < 1) throw new Error("Assets don't include a single file");
					const name = names[0];
					if (name.includes("styles/")) return name.replace("styles/", "styles/[name]-[hash].[ext]");
					return "assets/[name]-[hash].[ext]";
				},
			},
		},
	},
	plugins: [
		{
			name: "server-plugin",
			configureServer(server): void {
				server.middlewares.use(async (request, response, next) => {
					const { originalUrl, url, headers } = request;
					const { pathname } = new URL((originalUrl ?? url ?? "/"), `http://${headers.host}`);
					const { accept } = headers;
					if (accept === undefined) return next();
					if (!accept.includes("text/html")) return next();
					if (!pathname.endsWith("/") && FileSystem.existsSync(new URL(`${pathname.substring(1)}/index.html`, meta.url))) {
						response.statusCode = 301;
						response.writeHead(301, { ["location"]: `${pathname}/` });
						response.end();
						return;
					}

					if (routes.has(pathname)) return next();
					try {
						const content404 = await FileSystemAsync.readFile(new URL(input["404/index"], meta.url), "utf-8");
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
});
