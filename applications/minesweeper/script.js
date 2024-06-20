"use strict";

import { Random } from "../../scripts/modules/generators.js";
import { Matrix, Point2D } from "../../scripts/modules/measures.js";
import { Color } from "../../scripts/modules/palette.js";
import { } from "../../scripts/structure.js";

const { trunc, ceil } = Math;

//#region Privacy
/**
 * Enum for field privacy.
 * @enum {number}
 */
const Privacy = {
	/**
	 * Opened field
	 * @readonly
	 */
	opened: 0,
	/**
	 * Closed, unmarked field
	 * @readonly
	 */
	unmarked: 1,
	/**
	 * Closed field, marked as mine
	 * @readonly
	 */
	marked: 2,
	/**
	 * Closed field, marked as unknown
	 * @readonly
	 */
	unknown: 3,
};
Object.freeze(Privacy);
//#endregion
//#region Field
/**
 * Represents a field with or without mine.
 */
class Field {
	/**
	 * @param {number} danger 
	 * @throws {TypeError} If the danger is not an integer.
	 * @throws {RangeError} If the danger is out of range.
	 */
	constructor(danger) {
		if (!Number.isInteger(danger)) throw new TypeError(`The danger ${danger} must be finite integer number`);
		if (0 > danger || danger > Board.threshold) throw new RangeError(`The danger ${danger} is out of range [0 - ${Board.threshold}]`);
		this.#danger = danger;
	}
	/** @type {number} */
	#danger;
	/**
	 * Gets the content of the field.
	 * @readonly
	 * @returns {number}
	 * @throws {EvalError} If the field is not opened.
	 */
	get danger() {
		if (this.#privacy !== Privacy.opened) throw new EvalError(`Unable to read danger of closed field`);
		return this.#danger;
	}
	/** @type {Privacy} */
	#privacy = Privacy.unmarked;
	/**
	 * Gets the privacy of the field.
	 * @returns {Privacy}
	 */
	get privacy() {
		return this.#privacy;
	}
	/**
	 * Sets the privacy of the field.
	 * @param {Privacy} value 
	 * @returns {void}
	 * @throws {EvalError} If trying to open a field that contains a mine.
	 */
	set privacy(value) {
		if (this.#privacy === Privacy.opened) return;
		if (value === Privacy.opened && this.#danger === Board.threshold) throw new EvalError(`The field blew up`);
		this.#privacy = value;
	}
	/**
	 * Returns a string representation of a field.
	 * @returns {string}
	 */
	toString() {
		switch (this.#privacy) {
			case Privacy.opened: return (this.#danger < Board.threshold
				? `Opened ${this.#danger} field`
				: `Opened mine`
			);
			case Privacy.unmarked: return `Closed, unmarked field`;
			case Privacy.marked: return `Closed field, marked as mine`;
			case Privacy.unknown: return `Closed field, marked as unknown`;
			default: throw new TypeError(`Invalid privacy ${this.#privacy} status`);
		}
	}
}
//#endregion
//#region Board
/**
 * Represents the game board.
 */
class Board {
	/** @type {Point2D[]} */
	static #neighborhood = [
		new Point2D(-1, -1),
		new Point2D(0, -1),
		new Point2D(1, -1),
		new Point2D(-1, 0),
		new Point2D(1, 0),
		new Point2D(-1, 1),
		new Point2D(0, 1),
		new Point2D(1, 1),
	];
	/**
	 * @readonly
	 * @returns {number}
	 */
	static get threshold() {
		return Board.#neighborhood.length + 1;
	}
	/**
	 * Creates a board with the given size and mine count.
	 * @param {Readonly<Point2D>} size The size of the board.
	 * @param {number} count The number of mines.
	 * @throws {TypeError} If the x or y coordinate of the size is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the size is negative.
	 * @throws {TypeError} If count is not a finite integer.
	 * @throws {RangeError} If count is less than 0 or greater than the number of fields.
	 */
	constructor(size, count) {
		this.#matrix = new Matrix(size, () => new Field(0));

		const mines = Random.global
			.subarray(Array.from(Array(size.x * size.y).keys()), count)
			.map(field => this.#toPoint(field));

		/** @type {Map<number, number>} */
		const map = new Map();
		for (const mine of mines) {
			const index = this.#toNumber(mine);
			map.set(index, NaN);
			for (const neighbor of this.#getNeighborsAt(mine)) {
				const index = this.#toNumber(neighbor);
				map.set(index, (map.get(index) ?? 0) + 1);
			}
		}

		for (const [index, danger] of map) {
			const position = this.#toPoint(index);
			this.#matrix.set(position, new Field(Number.isNaN(danger)
				? Board.threshold
				: danger
			));
		}
	}
	/** @type {Matrix<Field>} */
	#matrix;
	/**
	 * @param {Point2D} point 
	 * @returns {number}
	 */
	#toNumber(point) {
		const size = this.#matrix.size;
		return point.y * size.x + point.x;
	}
	/**
	 * @param {number} number 
	 * @returns {Point2D}
	 */
	#toPoint(number) {
		const size = this.#matrix.size;
		return new Point2D(number % size.y, trunc(number / size.y));
	}
	/**
	 * @param {Readonly<Point2D>} position 
	 * @returns {Point2D[]}
	 */
	#getNeighborsAt(position) {
		const size = this.#matrix.size;
		const result = [];
		for (const offset of Board.#neighborhood) {
			const neighbor = position["+"](offset);
			if (0 > neighbor.x || neighbor.x >= size.x || 0 > neighbor.y || neighbor.y >= size.y) continue;
			result.push(neighbor);
		}
		return result;
	}
	/**
	 * Gets the status at the specified position.
	 * @param {Readonly<Point2D>} position The position of the field.
	 * @returns {number}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	getStatus(position) {
		const field = this.#matrix.get(position);
		switch (field.privacy) {
			case Privacy.opened: return field.danger;
			case Privacy.unmarked: return -1;
			case Privacy.marked: return -2;
			case Privacy.unknown: return -3;
			default: throw new TypeError(`Invalid privacy ${field.privacy} status for field at ${position}`);
		}
	}
	/**
	 * Opens the field at the specified position.
	 * @param {Readonly<Point2D>} position The position of the field.
	 * @returns {void}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 * @throws {EvalError} If trying to open a field that contains a mine.
	 */
	openField(position) {
		const field = this.#matrix.get(position);
		if (field.privacy === Privacy.opened) return;
		field.privacy = Privacy.opened;
		if (field.danger > 0) return;
		for (const neighbor of this.#getNeighborsAt(position)) {
			this.openField(neighbor);
		}
	}
};
//#endregion
//#region Controller
class Controller {
	/** @type {Point2D} */
	#size;
	/** @type {Board} */
	#board;
	/** @type {HTMLCanvasElement} */
	#canvas;
	/**
	 * @returns {void}
	 */
	#resize() {
		const { width, height } = this.#canvas.getBoundingClientRect();
		this.#canvas.width = width;
		this.#canvas.height = height;
	}
	/** @type {CanvasRenderingContext2D} */
	#context;
	/**
	 * @returns {void}
	 */
	#render() {
		this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

		const scale = new Point2D(this.#canvas.width / this.#size.x, this.#canvas.height / this.#size.y);
		this.#context.textBaseline = `alphabetic`;
		this.#context.textAlign = `center`;
		this.#context.font = `900 ${scale.y / 2}px monospace`;

		const gray = Color.GRAY;
		const darkgray = gray.illuminate(0.2);
		const green = Color.GREEN;
		const red = Color.RED;

		for (let y = 0; y < this.#size.y; y++) {
			for (let x = 0; x < this.#size.x; x++) {
				const position = new Point2D(x, y);
				const status = this.#board.getStatus(position);

				this.#context.fillStyle = (status < 0
					? gray
					: darkgray
				).toString();
				this.#context.strokeStyle = darkgray.toString();
				this.#context.beginPath();
				this.#context.rect(ceil(position.x * scale.x), ceil(position.y * scale.y), ceil(scale.x), ceil(scale.y));
				this.#context.fill();
				this.#context.stroke();

				this.#context.fillStyle = (status < 0
					? gray
					: green.mix(red, status / Board.threshold)
				).toString();
				if (status > 0 && status < Board.threshold) {
					const text = status.toString();
					const { actualBoundingBoxAscent } = this.#context.measureText(text);
					this.#context.fillText(text,
						scale.x * (position.x + 0.5),
						scale.y * (position.y + 0.5) + actualBoundingBoxAscent * 0.5,
						scale.x / 2
					);
				}
			}
		}
	}
	/**
	 * @returns {Promise<void>}
	 */
	async main() {
		this.#size = new Point2D(10, 10);
		this.#board = new Board(this.#size, 10);

		this.#canvas = await window.ensure(() => document.getElement(HTMLCanvasElement, `canvas#display`));
		this.#resize();
		window.addEventListener(`resize`, (event) => this.#resize());

		this.#context = await window.ensure(() => {
			const context = this.#canvas.getContext(`2d`);
			if (!context) throw new EvalError(`Unable to get context`);
			return context;
		});
		this.#render();
		window.addEventListener(`resize`, (event) => this.#render());

		this.#canvas.addEventListener(`click`, (event) => {
			event.preventDefault();
			const { width, height, x, y } = this.#canvas.getBoundingClientRect();
			const scale = new Point2D(width / this.#size.x, height / this.#size.y);
			const position = new Point2D(trunc((event.clientX - x) / scale.x), trunc((event.clientY - y) / scale.y));
			this.#board.openField(position);
			this.#render();
		});

		this.#canvas.addEventListener(`contextmenu`, async (event) => {
			event.preventDefault();
		});
	}
};
await window.load(new Controller().main(), 200, 1000);
//#endregion
