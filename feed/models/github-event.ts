"use strict";

import "adaptive-extender/web";

//#region GitHub event
interface GitHubEvent {
	type: string;
	created_at: string;
	repo: {
		name: string;
		url: string;
	};
	payload: {
		commits?: Array<{ message: string; }>;
		action?: string;
	};
}
//#endregion

export { type GitHubEvent };
