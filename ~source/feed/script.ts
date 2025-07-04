"use strict";

import "../scripts/dom/extensions.js";
import { WebpageController } from "../scripts/dom/extensions.js";
import { } from "../scripts/dom/palette.js";
import { } from "../scripts/dom/storage.js";

//#region Main controller
class MainController extends WebpageController {
	async run(): Promise<void> {
	}
}
//#endregion

MainController.Factory.build(new MainController);
