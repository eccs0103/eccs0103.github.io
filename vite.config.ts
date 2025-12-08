"use strict";

import "adaptive-extender/node";
import { defineConfig } from "vite";
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

export default defineConfig({
	publicDir: false,
	base: "/",
	build: {
		outDir: "dist",
		rollupOptions: {
			input,
			output: {
				entryFileNames: "scripts/[name]-[hash].js",
				chunkFileNames: "scripts/chunks/[name]-[hash].js",
				assetFileNames({ names }): string {
					if (names.length < 1) throw new Error("Assets don't include a single file");
					const [name] = names;
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
					const { pathname } = new URL(originalUrl ?? url ?? "/", `http://${headers.host}`);
					const { accept } = headers;
					if (accept === undefined) return next();
					if (!accept.includes("text/html")) return next();
					if (!pathname.endsWith("/") && FileSystem.existsSync(`${pathname.substring(1)}/index.html`)) {
						response.statusCode = 301;
						response.writeHead(301, { ["location"]: `${pathname}/` });
						response.end();
						return;
					}

					if (routes.has(pathname)) return next();
					try {
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
});
