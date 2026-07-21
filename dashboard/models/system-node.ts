"use strict";

import "adaptive-extender/core";
import { Enum, Field, Model, Nullable } from "adaptive-extender/core";

//#region System node kind
export enum SystemNodeKind {
	section = "section",
	external = "external",
	miniapp = "miniapp",
}
//#endregion
//#region System node status
export enum SystemNodeStatus {
	online = "online",
	building = "building",
	planned = "planned",
}
//#endregion
//#region System node
export interface SystemNodeScheme {
	callsign: string;
	name: string;
	description: string;
	href: string | null;
	kind: SystemNodeKind;
	status: SystemNodeStatus;
}

export class SystemNode extends Model {
	@Field(String, { name: "callsign" })
	callsign: string;

	@Field(String, { name: "name" })
	name: string;

	@Field(String, { name: "description" })
	description: string;

	@Field(Nullable.Of(String), { name: "href" })
	href: string | null;

	@Field(Enum.Of(SystemNodeKind), { name: "kind" })
	kind: SystemNodeKind;

	@Field(Enum.Of(SystemNodeStatus), { name: "status" })
	status: SystemNodeStatus;

	isReachable(): boolean {
		if (this.href === null) return false;
		return this.status === SystemNodeStatus.online || this.status === SystemNodeStatus.building;
	}

	opensExternally(): boolean {
		return this.kind === SystemNodeKind.external;
	}

	get statusLabel(): string {
		switch (this.status) {
		case SystemNodeStatus.online: return "Online";
		case SystemNodeStatus.building: return "Building";
		case SystemNodeStatus.planned: return "Planned";
		default: throw new TypeError(`Invalid '${this.status}' status`);
		}
	}
}
//#endregion
