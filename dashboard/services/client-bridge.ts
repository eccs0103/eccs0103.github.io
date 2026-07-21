"use strict";

import "adaptive-extender/web";
import { Bridge } from "./bridge.js";

//#region Client bridge
export class ClientBridge extends Bridge {
	async read(path: Readonly<URL>): Promise<string | null> {
		const response = await fetch(path);
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
		const content = await response.text();
		return content;
	}
}
//#endregion
