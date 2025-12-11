import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import { globSync } from "glob";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = "dist";
const ignore = ["node_modules/**", "dist/**", "vite.config.ts", "**/*.d.ts"];

export default defineConfig({
	root: ".",
	base: "./",
	build: {
		outDir,
		emptyOutDir: true,
		minify: false,
		sourcemap: false,
		cssCodeSplit: false,
		target: "ESNext",
		rollupOptions: {
			preserveEntrySignatures: "strict",
			input: Object.fromEntries(
				globSync("**/*.ts", { ignore }).map(file => [
					file.replace(/\.ts$/, ""),
					path.resolve(__dirname, file)
				])
			),
			output: {
				preserveModules: true,
				preserveModulesRoot: ".",
				entryFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
				exports: "named",
			},
		},
	},
	plugins: [
		{
			name: "copy-static-assets",
			async writeBundle(): Promise<void> {
				const files = globSync("**/*.*", { ignore, nodir: true, });
				for (const file of files) {
					const srcPath = path.resolve(__dirname, file);
					const destPath = path.resolve(__dirname, outDir, file);
					fs.mkdirSync(path.dirname(destPath), { recursive: true });
					if (!file.endsWith(".html")) {
						fs.copyFileSync(srcPath, destPath);
						continue;
					}
					let content = fs.readFileSync(srcPath, "utf-8");
					content = content.replace(/src="(.*?)\.ts"/g, "src=\"$1.js\"");
					fs.writeFileSync(destPath, content);
				}
			},
		}
	],
});
