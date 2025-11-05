import { defineConfig } from "vite";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

const rootDirectory: string = process.cwd();

const knownHtmlRoutes: string[] = ["/", "/feed/", "/applications/209-birthdays/", "/404.html"];

export default defineConfig({
	root: rootDirectory,
	publicDir: resolve(rootDirectory, "resources"),
	base: "/",
	build: {
		outDir: "dist",
		rollupOptions: {
			input: {
				main: resolve(rootDirectory, "index.html"),
				"feed/index": resolve(rootDirectory, "feed/index.html"),
				"applications/209-birthdays/index": resolve(rootDirectory, "applications/209-birthdays/index.html"),
				"404": resolve(rootDirectory, "404.html"), // Убедись, что 404.html есть
			},
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
			name: "minimal-mpa-dev-server-plugin",
			configureServer(server): void {
				server.middlewares.use(async (request, response, next) => {
					const url = request.url || "/";

					// --- 1. Правило "any-path и any-path/ одинаковые" ---
					// (Игнорируем файлы с расширением, типа .css, .js)
					if (!url.endsWith("/") && !url.includes(".")) {
						// Проверяем, существует ли .../any-path/index.html
						const potentialHtmlPath = resolve(rootDirectory, url.substring(1), "index.html");

						if (existsSync(potentialHtmlPath)) {
							// Если да, делаем 301 редирект на URL со слешем
							response.statusCode = 301; // Moved Permanently
							response.setHeader("Location", url + "/");
							return response.end();
						}
					}

					// --- 2. Правило "при 404 НЕ перенаправлять на главную" ---

					// Проверяем, является ли запрос известным HTML-маршрутом
					if (knownHtmlRoutes.includes(url)) return next(); // Да, это известный HTML, пусть Vite работает

					// Проверяем, является ли это запросом к файлу (CSS, JS, PNG)
					// или внутренним запросом Vite
					if (url.includes(".") || url.startsWith("/@") || url.startsWith("/node_modules")) return next();

					// --- Если мы дошли сюда, это 404 ---
					// (Неизвестный путь без расширения)

					// Мы не вызываем 'next()'. Вместо этого мы вручную 
					// отдаем 404.html ДО того, как Vite отдаст index.html.
					try {

						const html404 = readFileSync(resolve(rootDirectory, "404.html"), "utf-8");

						// "Скармливаем" HTML Vite, чтобы он вставил HMR и т.д.
						const transformedHtml = await server.transformIndexHtml(url, html404);
						response.statusCode = 404;
						response.setHeader("Content-Type", "text/html");
						response.end(transformedHtml);
						return;
					} catch (e: any) {
						response.statusCode = 500;
						response.end(`Internal Server Error: 404.html not found. ${e.message}`);
						return;
					}
				});
			},
		},
	],
});