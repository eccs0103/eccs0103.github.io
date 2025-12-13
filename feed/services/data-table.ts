"use strict";

import "adaptive-extender/core";
import { type PortableConstructor } from "adaptive-extender/core";

//#region Data table
export interface DataTable<C extends PortableConstructor> extends Array<InstanceType<C>> {
	load(): Promise<void>;
	save(): Promise<void>;
}
//#endregion
