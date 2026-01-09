"use strict";

import "adaptive-extender/node";
import FileSystem from "fs";
import AsyncFileSystem from "fs/promises";

//#region Server bridge
export class ServerBridge {
	async read(path: Readonly<URL>): Promise<string | null> {
		if (!FileSystem.existsSync(path)) return null;
		const content = await AsyncFileSystem.readFile(path, "utf-8");
		return content;
	}

	async write(path: Readonly<URL>, content: string): Promise<void> {
		await AsyncFileSystem.writeFile(path, content);
	}
}
//#endregion
