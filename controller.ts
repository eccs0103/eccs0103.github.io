"use strict";

import "adaptive-extender/web";

//#region Controller
/**
 * Represents a controller.
 * @abstract
 */
class Controller {
	/**
	 * @throws {TypeError} If the constructor is called on the abstract class.
	 */
	constructor() {
		if (new.target === Controller) throw new TypeError("Unable to create an instance of an abstract class");
	}
	/**
	 * Runs the controller.
	 */
	async run(): Promise<void> {
	}
	/**
	 * Catches an error.
	 */
	async catch(error: Error): Promise<void> {
	}
	/**
	 * Launches the controller.
	 */
	static async launch(this: new () => Controller): Promise<void> {
		const controller = Reflect.construct(this, []);
		try {
			await controller.run();
		} catch (reason) {
			await controller.catch(Error.from(reason));
		}
	}
}
//#endregion

export { Controller };
