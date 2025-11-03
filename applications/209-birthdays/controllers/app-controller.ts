"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { GroupService } from "../services/group-service.js";
import { SettingsService } from "../services/settings-service.js";
import { PickerView } from "../view/picker-view.js";
import { GroupController } from "./group-controller";

class AppController extends Controller {
	async run(): Promise<void> {
		const groupRepository = new GroupService();
		const settingsRepository = new SettingsService();
		const pickerView = new PickerView();
		const groupController = new GroupController(groupRepository, settingsRepository, pickerView);
		await groupController.run();
	}

	async catch(error: Error): Promise<void> {
		console.error(error);
	}
}

await AppController.launch();
