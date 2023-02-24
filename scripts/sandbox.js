//#region Initialize
const search = new Map(window.decodeURI(location.search.replace(/^\??/, ``)).split(`&`).filter(item => item).map((item) => {
	const [key, value] = item.split(`=`);
	return [key, value];
}));
const addressee = search.get(`addressee`) ?? null;
const text = [`Շնորհավոր\nմարտի 8`][0];

class Engine {
	/**
	 * @param {() => void} handler 
	 */
	constructor(handler) {
		const instance = this;
		requestAnimationFrame(function repeater(time) {
			instance.#time = time;
			handler();
			requestAnimationFrame(repeater);
		});
	}
	/** @type {DOMHighResTimeStamp} */ #time;
	/** @readonly */ get time() {
		return this.#time;
	}
}

const canvas = document.body.appendChild(document.createElement(`canvas`));
canvas.style.width = `100vw`;
canvas.style.height = `100vh`;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener(`resize`, (event) => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});
const context = (() => {
	const context = canvas.getContext(`2d`);
	if (!context) {
		throw new ReferenceError(`Element 'context' isn't defined.`);
	}
	return context;
})();
// context.translate(canvas.width / 2, canvas.height / 2);
//#endregion
//#region render
/**
 * @param {String} text 
 * @param {Number} size 
 */
function render(text, size) {
	const canvasTemp = document.createElement(`canvas`);
	// document.body.appendChild(canvasTemp)
	// canvas.hidden = true;
	canvasTemp.width = canvas.width;
	canvasTemp.height = canvas.height;
	const contextTemp = canvasTemp.getContext(`2d`);
	if (!contextTemp) {
		throw new ReferenceError(`Element 'contextTemp' isn't defined.`);
	}
	contextTemp.font = `${size}px system-ui`;
	const metrics = contextTemp.measureText(text);
	const width = metrics.width;
	const height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
	contextTemp.fillStyle = `white`;
	contextTemp.textBaseline = `middle`;
	contextTemp.textAlign = `center`;
	contextTemp.fillText(text, canvasTemp.width / 2, canvasTemp.height / 2);
	return contextTemp.getImageData(canvas.width / 2 - width / 2, canvas.height / 2 - height / 2, canvas.width, canvas.height);
}

/** @type {Map<String, ImageData>} */ const library = new Map();
const size = 50;
const duration = 1;

for (const char of text) {
	if (!library.has(char)) {
		library.set(char, render(char, size));
	}
}

const engine = new Engine(() => {
	context.fillStyle = `#00000010`;
	context.fillRect(0, 0, canvas.width, canvas.height);
	const phase = Math.floor(engine.time / (duration * 1000));
	const timeout = (engine.time % (duration * 1000)) / (duration * 1000);
	// rocket(canvas.width / 2, canvas.height / 2, duration);
	const a = library.get(text[0]);
	// console.log(a);
	const b = deconstruct(a);
	// console.log(b);
	explosion(b, canvas.width / 2, canvas.height / 2);
});

//#region circle()
/**
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} radius 
 */
function circle(x, y, radius) {
	context.fillStyle = `white`;
	context.beginPath();
	context.ellipse(x, y, radius, radius, 0, 0, 6.283);
	context.fill();
}
//#endregion
//#region rocket()
/**
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} duration
 */
function rocket(x, y, duration) {
	context.fillStyle = `white`;
	const time = (engine.time % (duration * 1000)) / (duration * 1000);
	const radius = 2 * (1 - time + 8 * Math.pow(time, 16 * time));
	circle(x, canvas.height - y * time, radius);
}
//#endregion
//#region deconstruct()
/**
 * @typedef Coordinate
 * @property {Number} x
 * @property {Number} y
 */
/**
 * @param {ImageData} image 
 */
function deconstruct(image) {
	/** @type {Array<Coordinate>} */ const particles = [];
	if (image.data.some(unit => unit)) {
		while (particles.length < 200) {
			const x = image.width * Math.random();
			const y = image.height * Math.random();
			const offset = Math.floor(y) * image.height * 4 + Math.floor(x) * 4;
			if (image.data[offset]) {
				particles.push({ x: x - image.width / 2, y: y - image.height / 2 });
			}
		}
	}
	return particles;
}
//#endregion

/**
 * @param {Array<Coordinate>} points 
 * @param {Number} xOffset 
 * @param {Number} yOffset 
 */
function explosion(points, xOffset, yOffset) {
	const T = Math.min(1, Math.max(0, (engine.time % duration / duration) - 0.33) * 2);
	const yDirty = (T * T * T) * 20;
	let radius = 3;
	radius = T < 0.5 ? (T + 0.5) * T * radius : radius - T * radius;
	context.fillStyle = `hsl(${55}, 55%, 55%)`;
	points.forEach(({ x, y }, index) => {
		if (index % 20 === 0) {
			context.fillStyle = `hsl(${55}, 55%, ${55 + T * Math.sin(T * 55 + index) * 45}%)`;
		}
		circle(xOffset + T * x, canvas.height - yDirty + yOffset + T * y, radius);
	});
}

/**
 * 
 * @param {Number} time 
 * @param {Number} index 
 * @param {Array<Array<Number>>} parts 
 */
function firework(time, index, parts) {
	time -= index * 200;
	const id = index + chars.length * Math.floor(time - time % duration);
	time = time % duration / duration;
	let dx = (index + 1) * window.innerWidth / (1 + chars.length);
	dx += Math.min(0.33, time) * 100 * Math.sin(id);
	let dy = window.innerHeight * 0.5;
	dy += Math.sin(id * 4547.411) * window.innerHeight * 0.1;
	if (time < 0.33) {
		rocket(dx, dy, time * 3);
	} else {
		explosion(parts, dx, dy, id, Math.min(1, Math.max(0, time - 0.33) * 2));
	}
}
//#endregion