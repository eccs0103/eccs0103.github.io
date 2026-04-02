"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Session identity
export class SessionIdentity extends Model {
	/** Persisted UUID for this browser (localStorage). Stable across page loads and browser restarts; resets only if the user clears storage. Sent with every GA4 event to link all sessions from the same browser. */
	@Field(String, "user_fingerprint")
	userFingerprint: string;

	/** Per-tab UUID (sessionStorage). Created fresh when the tab opens and discarded when the tab closes. Groups all events from a single visit together. */
	@Field(String, "session_fingerprint")
	sessionFingerprint: string;

	constructor();
	constructor(userFingerprint: string, sessionFingerprint: string);
	constructor(userFingerprint?: string, sessionFingerprint?: string) {
		if (userFingerprint === undefined || sessionFingerprint === undefined) {
			super();
			return;
		}

		super();
		this.userFingerprint = userFingerprint;
		this.sessionFingerprint = sessionFingerprint;
	}
}
//#endregion
