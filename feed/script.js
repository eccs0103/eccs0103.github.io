"use strict";
import "../scripts/dom/extensions.js";
import { WebpageController } from "../scripts/dom/extensions.js";
//#region Main controller
class MainController extends WebpageController {
    async run() {
    }
}
//#endregion
MainController.Factory.build(new MainController);
