"use strict";

//#region Promise
declare global {
	interface PromiseConstructor {
		/**
		 * Creates a promise that resolves after the specified timeout.
		 * @param timeout The timeout in milliseconds.
		 * @returns A promise that resolves after the timeout.
		 */
		withTimeout(timeout: number): Promise<void>;
		/**
		 * Creates a promise that can be controlled with an abort signal.
		 * @template T
		 * @param callback The callback to execute with an abort signal, resolve, and reject functions.
		 * @returns A promise that can be controlled with an abort signal.
		 */
		withSignal<T>(callback: (signal: AbortSignal, resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
	}
}

Promise.withTimeout = async function (timeout: number): Promise<void> {
	const { promise, resolve } = Promise.withResolvers<void>();
	let index;
	try {
		index = setTimeout(resolve, timeout);
		return await promise;
	} finally {
		clearTimeout(index);
	}
};

Promise.withSignal = async function <T>(callback: (signal: AbortSignal, resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T> {
	const controller = new AbortController();
	const { promise, resolve, reject } = Promise.withResolvers<T>();
	try {
		callback(controller.signal, resolve, reject);
		return await promise;
	} finally {
		controller.abort();
	}
};
//#endregion

export { };
