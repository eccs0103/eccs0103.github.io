"use strict";

import { Random } from "../../scripts/modules/generators.js";
import { Matrix, Point2D } from "../../scripts/modules/measures.js";
import { Color } from "../../scripts/modules/palette.js";
import { } from "../../scripts/structure.js";

const { trunc, ceil, min, max } = Math;

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
	 * @param {number} danger The danger level of the field.
	 * @throws {TypeError} If the danger is not an integer.
	 * @throws {RangeError} If the danger is out of range.
	 */
	constructor(danger) {
		if (!Number.isInteger(danger)) throw new TypeError(`The danger ${danger} must be finite integer number`);
		if (0 > danger || danger > Board.circumference) throw new RangeError(`The danger ${danger} is out of range [0 - ${Board.circumference}]`);
		this.#danger = danger;
	}
	/** @type {number} */
	#danger;
	/**
	 * Gets the danger level of the field.
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
	 * Gets the privacy state of the field.
	 * @returns {Privacy}
	 */
	get privacy() {
		return this.#privacy;
	}
	/**
	 * Sets the privacy state of the field.
	 * @param {Privacy} value 
	 * @returns {void}
	 * @throws {EvalError} If trying to open a field that contains a mine.
	 */
	set privacy(value) {
		if (this.#privacy === Privacy.opened) return;
		if (value === Privacy.opened && this.#danger === Board.circumference) throw new EvalError(`The field blew up`);
		this.#privacy = value;
	}
	/**
	 * Returns a string representation of a field.
	 * @returns {string}
	 */
	toString() {
		switch (this.#privacy) {
			case Privacy.opened: return (this.#danger < Board.circumference
				? `Opened ${this.#danger} field`
				: `Opened mine`
			);
			case Privacy.unmarked: return `Closed, unmarked field`;
			case Privacy.marked: return `Closed field, marked as mine`;
			case Privacy.unknown: return `Closed field, marked as unknown`;
			default: throw new TypeError(`Invalid privacy ${this.#privacy} state`);
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
	static #perimeter = [
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
	 * Gets the circumference of the board.
	 * @readonly
	 * @returns {number}
	 */
	static get circumference() {
		return Board.#perimeter.length + 1;
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
		this.#size = size;
		this.#count = count;

		this.#matrix = new Matrix(size, () => new Field(0));
	}
	/** @type {Readonly<Point2D>} */
	#size;
	/** @type {number} */
	#count;
	/**
	 * Converts a point to a number.
	 * @param {Readonly<Point2D>} point The point to convert.
	 * @returns {number} The corresponding number.
	 */
	#toNumber(point) {
		const size = this.#size;
		return point.y * size.x + point.x;
	}
	/**
	 * Converts a number to a point.
	 * @param {number} number The number to convert.
	 * @returns {Point2D} The corresponding point.
	 */
	#toPoint(number) {
		const size = this.#size;
		return new Point2D(number % size.y, trunc(number / size.y));
	}
	/**
	 * Gets the perimeter positions around a given position.
	 * @param {Readonly<Point2D>} position The central position.
	 * @returns {Point2D[]} The perimeter positions.
	 */
	#getPerimetersAt(position) {
		const size = this.#size;
		const result = [];
		for (const offset of Board.#perimeter) {
			const location = position["+"](offset);
			if (0 > location.x || location.x >= size.x || 0 > location.y || location.y >= size.y) continue;
			result.push(location);
		}
		return result;
	}
	/** @type {Matrix<Field>} */
	#matrix;
	/** @type {boolean} */
	#isInitialized = false;
	/** @type {boolean} */
	#isWon = false;
	/**
	 * Gets whether the board is won.
	 * @readonly
	 * @returns {boolean}
	 */
	get isWon() {
		return this.#isWon;
	}
	/** @type {boolean} */
	#isLost = false;
	/**
	 * Gets whether the board is lost.
	 * @readonly
	 * @returns {boolean}
	 */
	get isLost() {
		return this.#isLost;
	}
	/** @type {number} */
	#counter;
	/**
	 * Initializes the board by placing mines.
	 * @param {Readonly<Point2D>} position The position to initialize around.
	 * @returns {void}
	 */
	#initialize(position) {
		if (this.#isInitialized) return;
		const size = this.#size;
		const count = this.#count;
		const random = Random.global;

		this.#counter = size.x * size.y - count;
		const indices = new Set(Array(size.x * size.y).keys());
		indices.delete(this.#toNumber(position));
		for (const location of this.#getPerimetersAt(position)) {
			indices.delete(this.#toNumber(location));
		}
		const mines = random.subarray(Array.from(indices), count).map(field => this.#toPoint(field));

		/** @type {Map<number, number>} */
		const map = new Map();
		for (const mine of mines) {
			const index = this.#toNumber(mine);
			map.set(index, NaN);
			for (const location of this.#getPerimetersAt(mine)) {
				const index = this.#toNumber(location);
				map.set(index, (map.get(index) ?? 0) + 1);
			}
		}

		for (const [index, danger] of map) {
			const position = this.#toPoint(index);
			this.#matrix.set(position, new Field(Number.isNaN(danger)
				? Board.circumference
				: danger
			));
		}
		this.#isInitialized = true;
	}
	/**
	 * Rebuilds the board, resetting all fields.
	 * @returns {void}
	 */
	rebuild() {
		const size = this.#size;
		this.#matrix = new Matrix(size, () => new Field(0));
		this.#isInitialized = false;
		this.#isWon = false;
		this.#isLost = false;
	}
	/**
	 * Gets the state at the specified position.
	 * @param {Readonly<Point2D>} position The position of the field.
	 * @returns {number}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	getState(position) {
		const field = this.#matrix.get(position);
		switch (field.privacy) {
			case Privacy.opened: return field.danger;
			case Privacy.unmarked: return -1;
			case Privacy.marked: return -2;
			case Privacy.unknown: return -3;
			default: throw new TypeError(`Invalid privacy ${field.privacy} state for field at ${position}`);
		}
	}
	/**
	 * Opens the field at the specified position.
	 * @param {Readonly<Point2D>} position The position of the field.
	 * @returns {void}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 * @throws {EvalError} If the session is won or lost.
	 */
	digField(position) {
		if (this.#isWon) throw new EvalError(`The session is won. Start a new one`);
		if (this.#isLost) throw new EvalError(`The session is lost. Start a new one`);
		if (!this.#isInitialized) this.#initialize(position);
		const field = this.#matrix.get(position);
		if (field.privacy !== Privacy.unmarked) return;
		try {
			field.privacy = Privacy.opened;
			this.#counter--;
			if (this.#counter === 0) {
				this.#isWon = true;
			}
			if (field.danger > 0) return;
			for (const location of this.#getPerimetersAt(position)) {
				this.digField(location);
			}
		} catch (error) {
			if (!(error instanceof EvalError)) throw error;
			if (error.message !== `The field blew up`) throw error;
			this.#isLost = true;
		}
	}
	/**
	 * Marks the field at the specified position.
	 * @param {Readonly<Point2D>} position The position of the field.
	 * @returns {void}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 * @throws {EvalError} If the session is won or lost.
	 */
	markField(position) {
		if (this.#isWon) throw new EvalError(`The session is won. Start a new one`);
		if (this.#isLost) throw new EvalError(`The session is lost. Start a new one`);
		const field = this.#matrix.get(position);
		switch (field.privacy) {
			case Privacy.opened: {
				const danger = field.danger;
				let marks = 0;
				const unmarked = [];
				for (const location of this.#getPerimetersAt(position)) {
					const field = this.#matrix.get(location);
					switch (field.privacy) {
						case Privacy.marked:
						case Privacy.unknown: marks++;
						case Privacy.opened: break;
						default: {
							unmarked.push(location);
						} break;
					}
				}
				if (marks !== danger) return;
				for (const location of unmarked) {
					if (this.#isLost) return;
					this.digField(location);
				}
			} break;
			case Privacy.unmarked: {
				field.privacy = Privacy.marked;
			} break;
			case Privacy.marked: {
				field.privacy = Privacy.unknown;
			} break;
			case Privacy.unknown: {
				field.privacy = Privacy.unmarked;
			} break;
			default: throw new TypeError(`Invalid privacy ${field.privacy} state for field at ${position}`);
		}
	}
};
//#endregion
//#region Controller
/**
 * Represents the model controller.
 */
class Controller {
	/** @type {Point2D} */
	#size;
	/** @type {Board} */
	#board;
	/** @type {HTMLCanvasElement} */
	#canvas;
	/** @type {Point2D} */
	#scale;
	/**
	 * Resizes the canvas and adjusts the scale.
	 * @returns {void}
	 */
	#resize() {
		const canvas = this.#canvas;
		const { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
		const size = this.#size;
		this.#scale = new Point2D(width / size.x, height / size.y);
	}
	/** @type {CanvasRenderingContext2D} */
	#context;
	/**
	 * Writes text on the canvas at a specified position.
	 * @param {Readonly<Point2D>} position The position to write the text at.
	 * @param {string} text The text to write.
	 * @returns {void}
	 */
	#write(position, text) {
		const context = this.#context;
		const scale = this.#scale;
		context.save();
		const { actualBoundingBoxAscent } = context.measureText(text);
		context.fillText(text,
			scale.x * (position.x + 0.5),
			scale.y * (position.y + 0.5) + actualBoundingBoxAscent * 0.5,
			scale.x / 2
		);
		// context.strokeStyle = Color.WHITE.toString();
		// context.lineWidth = (min(scale.x, scale.y) >> 6).clamp(1, Infinity);
		// context.strokeText(text,
		// 	scale.x * (position.x + 0.5),
		// 	scale.y * (position.y + 0.5) + actualBoundingBoxAscent * 0.5,
		// 	scale.x / 2
		// );
		context.restore();
	}
	/** @type {Color} */
	#gray = Color.GRAY;
	/** @type {Color} */
	#darkgray = this.#gray.illuminate(0.2);
	/** @type {Color} */
	#green = Color.GREEN;
	/** @type {Color} */
	#yellow = Color.YELLOW;
	/** @type {Color} */
	#red = Color.RED;
	/**
	 * Renders the game board on the canvas.
	 * @returns {void}
	 */
	#render() {
		const context = this.#context;
		const canvas = this.#canvas;
		context.clearRect(0, 0, canvas.width, canvas.height);

		const scale = this.#scale;
		this.#context.textBaseline = `alphabetic`;
		this.#context.textAlign = `center`;
		this.#context.font = `900 ${scale.y / 2}px monospace`;
		this.#context.lineCap = `round`;
		this.#context.lineWidth = min(scale.x, scale.y) >> 5;

		const size = this.#size;
		const board = this.#board;
		const gray = this.#gray;
		const darkgray = this.#darkgray;
		const green = this.#green;
		const yellow = this.#yellow;
		const red = this.#red;

		for (let y = 0; y < size.y; y++) {
			for (let x = 0; x < size.x; x++) {
				const position = new Point2D(x, y);
				const state = board.getState(position);

				context.fillStyle = (state < 0
					? gray
					: darkgray
				).toString();
				context.strokeStyle = darkgray.toString();
				context.beginPath();
				context.rect(ceil(position.x * scale.x), ceil(position.y * scale.y), ceil(scale.x), ceil(scale.y));
				context.fill();
				context.stroke();

				if (state > 0) {
					context.fillStyle = green.mix(red, state / Board.circumference).toString();
					this.#write(position, state.toString());
				} else if (state === -2) {
					context.fillStyle = red.toString();
					this.#write(position, `!`);
				} else if (state === -3) {
					context.fillStyle = yellow.toString();
					this.#write(position, `?`);
				}
			}
		}
	}
	/**
	 * Gets the area of the canvas under the mouse pointer.
	 * @param {MouseEvent} event The mouse event.
	 * @returns {Point2D} The position of the mouse on the canvas.
	 */
	#getMouseArea({ clientX, clientY }) {
		const canvas = this.#canvas;
		const { x, y } = canvas.getBoundingClientRect();
		const scale = this.#scale;
		return new Point2D(trunc((clientX - x) / scale.x), trunc((clientY - y) / scale.y));
	}
	/**
	 * Checks if the game session is won and optionally displays a confirmation dialog.
	 * @param {boolean} already Whether the session is already won.
	 * @returns {Promise<boolean>} Whether the session is won.
	 */
	async #isSessionWon(already) {
		const isWon = this.#board.isWon;
		let message = `The session is won. Start a new one?`;
		if (!already) message = `The board is neutralized.\n${message}`;
		if (isWon && await window.confirmAsync(message)) {
			this.#board.rebuild();
			this.#render();
		}
		return isWon;
	}
	/**
	 * Checks if the game session is lost and optionally displays a confirmation dialog.
	 * @param {boolean} already Whether the session is already lost.
	 * @returns {Promise<boolean>} Whether the session is lost.
	 */
	async #isSessionLost(already) {
		const isLost = this.#board.isLost;
		let message = `The session is lost. Start a new one?`;
		if (!already) message = `The field blew up.\n${message}`;
		if (isLost && await window.confirmAsync(message)) {
			this.#board.rebuild();
			this.#render();
		}
		return isLost;
	}
	/**
	 * Checks if the game session is suspended.
	 * @param {boolean} already Whether the session is already suspended.
	 * @returns {Promise<boolean>} Whether the session is suspended.
	 */
	async #isSessionSuspended(already) {
		return (await this.#isSessionWon(already) || await this.#isSessionLost(already));
	}
	/**
	 * The main method to initialize and start the game.
	 * @returns {Promise<void>}
	 */
	async main() {
		this.#size = new Point2D(9, 9);
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

		this.#canvas.addEventListener(`click`, async (event) => {
			event.preventDefault();
			if (await this.#isSessionSuspended(true)) return;
			const position = this.#getMouseArea(event);
			this.#board.markField(position);
			this.#render();
			if (await this.#isSessionSuspended(false)) return;
		});

		this.#canvas.addEventListener(`contextmenu`, async (event) => {
			event.preventDefault();
			if (await this.#isSessionSuspended(true)) return;
			const position = this.#getMouseArea(event);
			this.#board.digField(position);
			this.#render();
			if (await this.#isSessionSuspended(false)) return;
		});
	}
};
await window.load(new Controller().main());
//#endregion
