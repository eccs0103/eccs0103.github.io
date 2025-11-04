"use strict";

import "adaptive-extender/web";
import { Group } from "../models/group.js";

//#region Group service
class GroupService {
	async readGroup(): Promise<Group> {
		const response = await fetch("./data/database-2025.json");
		const object = await response.json();
		return Group.import(object, "database-2025.json");
	}
}
//#endregion

export { GroupService };
