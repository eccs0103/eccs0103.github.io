"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { type SystemNode } from "../models/system-node.js";
import { HUDBuilder } from "./hud-builder.js";

//#region Nav console renderer
export class NavConsoleRenderer extends Controller<[HTMLElement, readonly SystemNode[]]> {
	async run(panel: HTMLElement, nodes: readonly SystemNode[]): Promise<void> {
		const body = await panel.getElementAsync(HTMLElement, ".hud-panel-body");
		const grid = body.appendChild(document.createElement("div"));
		grid.classList.add("hud-node-grid");

		for (const node of nodes) {
			grid.appendChild(HUDBuilder.newNodeTile(node));
		}

		panel.classList.replace("awaiting-boot", "booted");
	}
}
//#endregion
