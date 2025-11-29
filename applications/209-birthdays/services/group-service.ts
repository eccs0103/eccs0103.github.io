"use strict";

import "adaptive-extender/web";
import { Group } from "../models/group.js";
import database from "../data/database-2025.json";

//#region Group service
export class GroupService {
	async readGroup(): Promise<Group> {
		return Group.import(database, "database-2025.json");
	}
}
//#endregion
