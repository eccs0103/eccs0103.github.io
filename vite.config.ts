import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

const root: string = process.cwd();

const rollupInput: Record<string, string> = {
	["main"]: resolve(root, "index.html"),
	["feed/index"]: resolve(root, "feed/index.html"),
	["applications/209-birthdays/index"]: resolve(root, "applications/209-birthdays/index.html"),
	["404"]: resolve(root, "404/index.html"),
};

const knownHtmlRoutes: string[] = Object.keys(rollupInput).map(key => {
	if (key === "main") return "/";
	if (key === "404") return "/404/index.html";
	return `/${key.replace(/\/index$/, "")}/`;
});

export default defineConfig({
	root,
	publicDir: resolve(root, "resources"),
	base: "/",
	build: {
		outDir: "dist",
		rollupOptions: {
			input: rollupInput,
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
			name: "clean-mpa-dev-server-plugin",
			configureServer(server): void {
				server.middlewares.use(async (request, response, next) => {
					const { originalUrl, url, headers } = request;
					const { pathname } = new URL(originalUrl ?? url ?? "/", `http://${headers.host}`);

					const accept = headers.accept ?? String.empty;
					if (!accept.includes("text/html") && !accept.includes("*/*")) return next();

					if (!pathname.endsWith("/") && fs.existsSync(resolve(root, pathname.substring(1), "index.html"))) {
						response.statusCode = 301;
						response.setHeader("Location", `${pathname}/`);
						response.end();
						return;
					}

					if (knownHtmlRoutes.includes(pathname)) return next();

					try {
						const html404 = fs.readFileSync(rollupInput["404"], "utf-8");
						const transformedHtml = await server.transformIndexHtml(pathname, html404);
						response.statusCode = 404;
						response.setHeader("Content-Type", "text/html");
						response.end(transformedHtml);
						return;
					} catch (reason) {
						response.statusCode = 500;
						response.setHeader("Content-Type", "text/plain");
						response.end(Error.from(reason).toString());
						return;
					}
				});
			},
		},
	],
});