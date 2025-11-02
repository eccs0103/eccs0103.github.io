import { defineConfig } from "vite";
import { resolve } from "path";

const rootDirectory: string = process.cwd();

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
			},
			output: {
				entryFileNames: "scripts/[name]-[hash].js",
				chunkFileNames: "scripts/chunks/[name]-[hash].js",
				assetFileNames: ({ names }) => {
					if (names.length < 1) throw new Error("Assets don't include a single file");
					const name = names[0];
					if (name.includes("styles/")) return name.replace("styles/", "styles/[name]-[hash].[ext]");
					if (name.includes("resources/")) return name.replace("resources/", "assets/resources/[name]-[hash].[ext]");
					return "assets/[name]-[hash].[ext]";
				},
			},
		},
	},
});