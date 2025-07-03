"use strict";
Promise.withTimeout = async function (timeout) {
    const { promise, resolve } = Promise.withResolvers();
    let index;
    try {
        index = setTimeout(resolve, timeout);
        return await promise;
    }
    finally {
        clearTimeout(index);
    }
};
Promise.withSignal = async function (callback) {
    const controller = new AbortController();
    const { promise, resolve, reject } = Promise.withResolvers();
    try {
        callback(controller.signal, resolve, reject);
        return await promise;
    }
    finally {
        controller.abort();
    }
};
export {};
