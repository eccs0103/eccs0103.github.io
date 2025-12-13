"use strict";

import "adaptive-extender/node";
import FileSystem from "fs";
import AsyncFileSystem from "fs/promises";
import { type ViteDevServer, type PreviewServer } from "vite";
import { VitePlugin } from "./vite-plugin.js";

//#region Server routing plugin
export class ServerRoutingPlugin extends VitePlugin {
	static #patternBackslash: RegExp = /\\/g;
	#inputs: Set<string>;
	#emergency: string;

	constructor(files: string[], emergency: string) {
		super("server-routing");
		this.#inputs = new Set(files.map(file => `/${file.replace(ServerRoutingPlugin.#patternBackslash, "/")}`));
		this.#emergency = emergency;
	}

	#applyMiddleware(server: ViteDevServer | PreviewServer): void {
		const inputs = this.#inputs;
		const emergency = this.#emergency;

		server.middlewares.use(async (request, response, next) => {
			const { originalUrl, url, headers } = request;
			const { pathname } = new URL(originalUrl ?? url ?? "/", `http://${headers.host}`);
			const { accept } = headers;

			if (accept === undefined) return next();
			if (!accept.includes("text/html")) return next();

			if (!pathname.endsWith("/") && inputs.has(`${pathname}/index.html`)) {
				response.statusCode = 301;
				response.writeHead(301, { ["location"]: `${pathname}/` });
				response.end();
				return;
			}

			if (inputs.has(pathname) || inputs.has(pathname + "index.html")) return next();

			try {
				if (!FileSystem.existsSync(emergency)) throw new Error("404 page file missing");
				const content404 = await AsyncFileSystem.readFile(emergency, "utf-8");
				const html404 = "transformIndexHtml" in server
					? await server.transformIndexHtml(pathname, content404)
					: content404;
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

	configureServer(server: ViteDevServer): void {
		this.#applyMiddleware(server);
	}

	configurePreviewServer(server: PreviewServer): void {
		this.#applyMiddleware(server);
	}
}
//#endregion
