class Engine {
	/**
	 * 
	 * @param {() => void} handler 
	 */
	constructor(handler) {
		let previous = performance.now();
		const instance = this;
		instance.#time = 0;
		instance.#FPS = 0;
		requestAnimationFrame(function repeater(time) {
			instance.#time = time;
			let current = performance.now();
			instance.#FPS = 1000 / (current - previous);
			handler();
			previous = current;
			requestAnimationFrame(repeater);
		});
	}
	/** @type {Number} */ #time;
	/** @readonly */ get time() {
		return this.#time;
	}
	/** @type {Number} */ #FPS;
	/** @readonly */ get FPS() {
		return this.#FPS;
	}
}

const engine = new Engine(() => {
	
});