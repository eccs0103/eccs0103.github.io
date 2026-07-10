"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region GitHub issue search result
export interface GitHubIssueSearchResultScheme {
	total_count: number;
}

export class GitHubIssueSearchResult extends Model {
	@Field(Number, { name: "total_count" })
	totalCount: number;
}
//#endregion
