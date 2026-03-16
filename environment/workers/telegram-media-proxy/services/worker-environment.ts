"use strict";

import "adaptive-extender/core";
import { type PortableConstructor } from "adaptive-extender/core";

//#region Worker environment
export interface Environment extends Record<string, string> {
}

export class EnvironmentProvider {
	static resolve<M extends PortableConstructor<InstanceType<M>>>(environment: Environment, model: M): Readonly<InstanceType<M>> {
		const record: Record<string, unknown> = {};
		for (const key of Object.keys(environment)) {
			try {
				record[key] = JSON.parse(environment[key]);
			} catch (reason) {
				if (!(reason instanceof SyntaxError)) throw reason;
				record[key] = environment[key];
			}
		}
		const instance = model.import(record, model.name); // Add name
		return Object.freeze(instance);
	}
}
//#endregion
