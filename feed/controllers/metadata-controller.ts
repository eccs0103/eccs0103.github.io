"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { MetadataInjector } from "../../environment/services/metadata-injector.js";
import { type Platform } from "../models/configuration.js";

const { baseURI } = document;

//#region Metadata controller
export class MetadataController extends Controller<[readonly Platform[]]> {
	async run(platforms: readonly Platform[]): Promise<void> {
		MetadataInjector.inject({
			type: "Person",
			name: "eccs0103",
			webpage: new URL("https://eccs0103.github.io"),
			preview: new URL("../icons/circuit-transparent.gif", baseURI),
			associations: platforms
				.map(platform => platform.webpage)
				.filter(webpage => webpage !== null)
				.map(webpage => new URL(webpage)),
			job: "Software engineer",
			description: "Webpage of the person known by the nickname eccs0103.",
		});
	}
}
//#endregion
