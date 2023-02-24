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
		requestAnimationFrame(function callback(time) {
			instance.#time = time;
			handler();
			requestAnimationFrame(callback);
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

function resize() {
	const rect = canvas.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;
}
resize();
window.addEventListener(`resize`, resize);

const context = (() => {
	const context = canvas.getContext(`2d`);
	if (!context) {
		throw new ReferenceError(`Element 'context' isn't defined.`);
	}
	return context;
})();
// context.translate(canvas.width / 2, canvas.height / 2);
//#endregion
//#region 
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
const size = 100;
const duration = 1;

for (const char of text) {
	if (!library.has(char)) {
		library.set(char, render(char, size));
	}
}

/** @type {Number?} */ let current = null;
/** @type {Array<Array<Coordinate>>} */ const maps = [];
const engine = new Engine(() => {
	context.fillStyle = `#00000010`;
	context.fillRect(0, 0, canvas.width, canvas.height);
	const phase = Math.floor(engine.time / (duration * 1000));
	if (current !== phase) {
		maps.splice(0, maps.length, ...Array.from(text.split(`\s`)[0]).map((char) => {
			const data = library.get(char);
			if (!data) {
				throw new ReferenceError(`Element 'data' isn't defined.`);
			}
			return map(data);
		}));
		current = phase;
	}
	let time = engine.time;
	maps.forEach((map, index) => {
		time -= index * 200;
		const id = index + map.length * Math.floor(time - time % duration);
		time = time % duration / duration;
		let dx = (index + 1) * canvas.height / (1 + map.length);
		dx += Math.min(0.33, time) * 100 * Math.sin(id);
		let dy = canvas.height * 0.5;
		dy += Math.sin(id * 4547.411) * canvas.height * 0.1;
		if (time < 0.33) {
			rocket(dx, dy, duration);
		} else {
			explosion(map, dx, dy);
		}
	});
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
	const cycle = engine.time % (duration * 1000) / (duration * 1000);
	const radius = 2 * (1 - cycle + 8 * Math.pow(cycle, 16 * cycle));
	circle(x, canvas.height - y * cycle, radius);
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
function map(image) {
	/** @type {Array<Coordinate>} */ const chart = [];
	if (image.data.some(unit => unit)) {
		while (chart.length < 200) {
			const x = image.width * Math.random();
			const y = image.height * Math.random();
			const offset = Math.floor(y) * image.height * 4 + Math.floor(x) * 4;
			if (image.data[offset]) {
				chart.push({ x: x - image.width / 2, y: y - image.height / 2 });
			}
		}
	}
	return chart;
}
//#endregion
//#region explosion()
/**
 * @param {Array<Coordinate>} points 
 * @param {Number} xOffset 
 * @param {Number} yOffset 
 */
function explosion(points, xOffset, yOffset) {
	const cycle = engine.time % (duration * 1000) / (duration * 1000);
	const T = Math.max(0, Math.min(cycle, 1));
	const yDirty = (T * T * T) * 20;
	let radius =/*  Math.sin(id) +  */3;
	radius = T < 0.5 ? (T + 0.5) * T * radius : radius - T * radius;
	context.fillStyle = `hsl(${/* id *  */55}, 55%, 55%)`;
	points.forEach(({ x, y }, index) => {
		if (index % 20 == 0) {
			context.fillStyle = `hsl(${/* id *  */55}, 55%, ${55 + T * Math.sin(T * 55 + index) * 45}%)`;
		}
		circle(xOffset + T * x, yOffset + T * y - yDirty, radius);
	});
}
//#endregion
//#endregion