"use strict";

import "adaptive-extender/node";
import { type ServerResponse } from "node:http";
import { type Connect, type PreviewServer, type ViteDevServer } from "vite";
import { VitePlugin } from "./vite-plugin.js";
import { env } from "../services/local-environment.js";

//#region Fix trailing slash plugin
export class FixTrailingSlashPlugin extends VitePlugin {
	constructor() {
		super("fix-trailing-slash");
	}

	#redirect(request: Connect.IncomingMessage, response: ServerResponse, next: Connect.NextFunction): void {
		if (request.url === undefined) return next();
		const url = new URL(`http://${env.host}${request.url}`);
		console.log(url.toString()); /** @todo Remove before production */
		// const [url] = request.url.split("?", 2);
		// if (url.startsWith("/@") || url.includes("/node_modules/") || url.includes("/.vite/")) return next();
		// console.log(url); /** @todo Remove before production */
		// if (url.includes(".") || url.endsWith("/")) return next();
		// response.statusCode = 301;
		// response.setHeader("Location", `${request.url}/`);
		// response.end();
		return next();
	}

	configureServer(server: ViteDevServer): void {
		// server.middlewares.use(this.#redirect.bind(this));
	}

	configurePreviewServer(server: PreviewServer): void {
		// server.middlewares.use(this.#redirect.bind(this));
	}
}
//#endregion
