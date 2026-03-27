"use strict";

import "adaptive-extender/core";

//#region Cache service
export class CacheService {
	keyFor(request: Request): string {
		const range = request.headers.get("range");
		if (range === null) return request.url;
		return `${request.url}&_range=${encodeURIComponent(range)}`;
	}

	async tryMatch(key: string): Promise<Response | null> {
		try {
			const cached = await caches.default.match(key);
			if (cached === undefined) return null;
			if (!this.#isValid(cached)) {
				void caches.default.delete(key).catch((reason: unknown) =>
					console.error(`Cache eviction failed:\n${Error.from(reason)}`)
				);
				return null;
			}
			return cached;
		} catch (reason) {
			console.error(`Cache lookup failed:\n${Error.from(reason)}`);
			return null;
		}
	}

	tryStore(key: string, response: Response, context: ExecutionContext): void {
		if (response.status !== 200 && response.status !== 206) return;
		if (response.body === null) return;
		context.waitUntil(caches.default.put(key, response.clone()).catch((reason: unknown) =>
			console.error(`Cache store failed:\n${Error.from(reason)}`)
		));
	}

	#isValid(response: Response): boolean {
		if (response.status !== 200 && response.status !== 206) return false;
		if (!response.headers.has("Content-Type")) return false;
		return true;
	}
}
//#endregion
