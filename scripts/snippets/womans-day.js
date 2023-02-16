//#region Initialize
const canvas = document.body.appendChild(document.createElement(`canvas`));
const context = (() => {
	const result = canvas.getContext(`2d`);
	if (!result) {
		throw new ReferenceError(`Element 'context' isn't defined.`);
	}
	return result;
})();
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener(`resize`, (event) => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});
//#endregion

requestAnimationFrame(function handler(time) {
	repeater(time);
	requestAnimationFrame(handler);
});

const text = [`Շնորհավոր\nՄարտի\n8`, `Հրավիրում ենք ձեզ\n@name\nմարտի 11-ին`];
const parts = text[0].split(/\s+/);
const duration = 3000;
const maxParticles = 100;

/** @type {Number?} */ let current = null;
/** @type {Array<Array<Array<Number>>>} */ let chars = [];

/**
 * 
 * @param {DOMHighResTimeStamp} time 
 */
function repeater(time) {
	const phase = Math.floor(time / duration) % parts.length;
	context.fillStyle = `#00000010`;
	context.fillRect(0, 0, window.innerWidth, window.innerHeight);
	if (current !== phase) {
		chars = [...parts[phase]].map((symbol) => visualize(symbol));
		current = phase;
	}
	chars.forEach((parts, index) => {
		firework(time, index, parts);
	});
}

/**
 * 
 * @param {String} symbol 
 * @returns 
 */
function visualize(symbol) {
	const canvasTemp = document.createElement(`canvas`);
	const size = canvasTemp.height = 200;
	const contextTemp = canvasTemp.getContext(`2d`);
	if (!contextTemp) {
		throw new ReferenceError(`Element 'contextTemp' isn't defined.`);
	}
	contextTemp.font = `bold ${size}px Arial`;
	contextTemp.fillStyle = `white`;
	contextTemp.textBaseline = `middle`;
	contextTemp.textAlign = `center`;
	contextTemp.fillText(symbol, size / 2, size / 2);
	const symbolData = contextTemp.getImageData(0, 0, size, size);
	const particles = [];
	if (symbolData.data.filter(unit => unit).length > 0) {
		while (particles.length <= maxParticles) {
			const x = size * Math.random();
			const y = size * Math.random();
			const offset = Math.floor(y) * size * 4 + Math.floor(x) * 4;
			if (symbolData.data[offset]) {
				particles.push([x - size / 2, y - size / 2]);
			}
		}
	}
	return particles;
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
		rocket(dx, dy, id, time * 3);
	} else {
		explosion(parts, dx, dy, id, Math.min(1, Math.max(0, time - 0.33) * 2));
	}
}

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} id 
 * @param {Number} time 
 */
function rocket(x, y, id, time) {
	context.fillStyle = `white`;
	const radius = 2 - 2 * time + Math.pow(time, 15 * time) * 16;
	y = window.innerHeight - y * time;
	circle(x, y, radius);
}

/**
 * 
 * @param {Array<Array<Number>>} parts 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} id 
 * @param {Number} time 
 */
function explosion(parts, x, y, id, time) {
	let dy = (time * time * time) * 20;
	let radius = Math.sin(id) * 1 + 3;
	radius = time < 0.5 ? (time + 0.5) * time * radius : radius - time * radius;
	context.fillStyle = `hsl(${id * 55}, 55%, 55%)`;
	parts.forEach((xy, i) => {
		if (i % 20 === 0) {
			context.fillStyle = `hsl(${id * 55}, 55%, ${55 + time * Math.sin(time * 55 + i) * 45}%)`;
		}
		circle(time * xy[0] + x, window.innerHeight - y + time * xy[1] + dy, radius);
	});
}

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} radius 
 */
function circle(x, y, radius) {
	context.beginPath();
	context.ellipse(x, y, radius, radius, 0, 0, 6.283);
	context.fill();
}