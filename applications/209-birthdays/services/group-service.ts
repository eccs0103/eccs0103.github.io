"use strict";

import "adaptive-extender/web";
import { Group } from "../models/group.js";

//#region Group service
class GroupService {
	async getGroup(): Promise<Group> {
		const response = await fetch("./database-2025.json");
		const object = await response.json();
		return Group.import(object);
	}
}
//#endregion

export { GroupService };
