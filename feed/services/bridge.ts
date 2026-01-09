"use strict";

import "adaptive-extender/core";

//#region Bridge
export abstract class Bridge {
	abstract read(path: Readonly<URL>): Promise<string | null>;
	abstract write(path: Readonly<URL>, content: string): Promise<void>;
}
//#endregion
