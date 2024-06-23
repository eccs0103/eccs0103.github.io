"use strict";

import { Queue } from "../../scripts/modules/extensions.js";
import { Random } from "../../scripts/modules/generators.js";
import { Matrix, Point2D } from "../../scripts/modules/measures.js";
import { Color } from "../../scripts/modules/palette.js";
import { } from "../../scripts/structure.js";

const { trunc, ceil, min } = Math;

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
		if (0 > danger || danger > Board.peakDanger) throw new RangeError(`The danger ${danger} is out of range [0 - ${Board.peakDanger}]`);
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
		this.#privacy = value;
		if (value === Privacy.opened && this.#danger === Board.peakDanger) throw new EvalError(`The field blew up`);
	}
	/**
	 * Returns a string representation of a field.
	 * @returns {string}
	 */
	toString() {
		switch (this.#privacy) {
			case Privacy.opened: return (this.#danger < Board.peakDanger
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
//#region Outcome options
/**
 * @enum {boolean?}
 */
const OutcomeOptions = {
	/**
	 * @readonly
	 */
	unknown: null,
	/**
	 * @readonly
	 */
	victory: true,
	/**
	 * @readonly
	 */
	defeat: false,
};
Object.freeze(OutcomeOptions);
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
	 * Gets the peak value of the danger in the board.
	 * @readonly
	 * @returns {number}
	 */
	static get peakDanger() {
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
		const maxCount = size.x * size.y - Board.peakDanger;
		if (count > maxCount) throw new RangeError(`Count ${count} is to much for size ${size}. Max available count is ${maxCount}`);

		this.#size = size;
		this.#count = count;

		this.#modifications = new Queue();
		this.#matrix = new Matrix(size, (position) => new Field(0));
		this.#isInitialized = false;
		this.#outcome = OutcomeOptions.unknown;
		this.#counter = size.x * size.y - count;
	}
	/** @type {Readonly<Point2D>} */
	#size;
	/**
	 * @readonly
	 * @returns {Readonly<Point2D>}
	 */
	get size() {
		return this.#size;
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
	/** @type {number} */
	#count;
	/** @type {number} */
	#counter;
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
	/** @type {Matrix<Field>} */
	#matrix;
	/** @type {boolean} */
	#isInitialized;
	/** @type {OutcomeOptions} */
	#outcome;
	/**
	 * @readonly
	 * @returns {OutcomeOptions}
	 */
	get outcome() {
		return this.#outcome;
	}
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

		const matrix = this.#matrix;
		for (const [index, danger] of map) {
			const position = this.#toPoint(index);
			matrix.set(position, new Field(Number.isNaN(danger)
				? Board.peakDanger
				: danger
			));
		}
		this.#isInitialized = true;
	}
	/** @type {Queue<Readonly<Point2D>>} */
	#modifications;
	/**
	 * @readonly
	 * @returns {Queue<Readonly<Point2D>>}
	 */
	get modifications() {
		return this.#modifications;
	}
	/**
	 * @returns {void}
	 */
	#onSuspend() {
		const size = this.#size;
		for (let x = 0; x < size.x; x++) {
			for (let y = 0; y < size.y; y++) {
				const position = new Point2D(x, y);
				const field = this.#matrix.get(position);
				if (field.privacy === Privacy.opened) continue;
				this.#tryDigField(field);
				this.#modifications.push(position);
			}
		}
	}
	/**
	 * Rebuilds the board, resetting all fields.
	 * @returns {void}
	 */
	rebuild() {
		const size = this.#size;
		const count = this.#count;

		this.#modifications.clear();
		this.#matrix = new Matrix(size, (position) => new Field(0));
		this.#isInitialized = false;
		this.#outcome = OutcomeOptions.unknown;
		this.#counter = size.x * size.y - count;
	}
	/**
	 * Gets the state at the specified position.
	 * @param {Readonly<Point2D>} position The position of the field.
	 * @returns {number}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	getStateAt(position) {
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
	 * @param {Field} field 
	 * @returns {boolean}
	 */
	#tryDigField(field) {
		try {
			field.privacy = Privacy.opened;
		} catch (error) {
			if (!(error instanceof EvalError)) throw error;
			if (error.message !== `The field blew up`) throw error;
			return false;
		}
		return true;
	}
	/**
	 * Opens the field at the specified position.
	 * @param {Readonly<Point2D>} position The position of the field.
	 * @returns {void}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	digFieldAt(position) {
		if (!this.#isInitialized) this.#initialize(position);
		const field = this.#matrix.get(position);
		if (field.privacy !== Privacy.unmarked) return;
		const isSuccessful = this.#tryDigField(field);
		this.#modifications.push(position);
		this.#counter--;
		if (!isSuccessful) {
			if (this.#outcome === OutcomeOptions.unknown) {
				this.#outcome = OutcomeOptions.defeat;
				this.#onSuspend();
			}
			return;
		}
		if (this.#outcome === OutcomeOptions.unknown && this.#counter === 0) {
			this.#outcome = OutcomeOptions.victory;
			this.#onSuspend();
		}
		if (field.danger === 0) {
			for (const location of this.#getPerimetersAt(position)) {
				this.digFieldAt(location);
			}
		}
	}
	/**
	 * Marks the field at the specified position.
	 * @param {Readonly<Point2D>} position The position of the field.
	 * @returns {void}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	markFieldAt(position) {
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
					this.digFieldAt(location);
				}
			} break;
			case Privacy.unmarked: {
				field.privacy = Privacy.marked;
				this.#modifications.push(position);
			} break;
			case Privacy.marked: {
				field.privacy = Privacy.unknown;
				this.#modifications.push(position);
			} break;
			case Privacy.unknown: {
				field.privacy = Privacy.unmarked;
				this.#modifications.push(position);
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
	/** @type {HTMLElement} */
	#main;
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
	#resizeCanvas() {
		const size = this.#board.size;
		const main = this.#main;
		main.style.setProperty(`--board-width`, `${size.x}`);
		main.style.setProperty(`--board-height`, `${size.y}`);
		const canvas = this.#canvas;
		const { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
		this.#scale = new Point2D(width / size.x, height / size.y);
	}
	/** @type {CanvasRenderingContext2D} */
	#context;
	/**
	 * @returns {void}
	 */
	resizeContext() {
		const context = this.#context;
		const scale = this.#scale;
		context.font = `900 ${scale.y / 2}px monospace`;
		context.lineWidth = min(scale.x, scale.y) >> 5;
	}
	/**
	 * Writes text on the canvas at a specified position.
	 * @param {Readonly<Point2D>} position The position to write the text at.
	 * @param {string} text The text to write.
	 * @returns {void}
	 */
	#writeAt(position, text) {
		const context = this.#context;
		const scale = this.#scale;
		const { actualBoundingBoxAscent } = context.measureText(text);
		context.fillText(text,
			scale.x * (position.x + 0.5),
			scale.y * (position.y + 0.5) + actualBoundingBoxAscent * 0.5,
			scale.x / 2
		);
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
	 * @param {Readonly<Point2D>} position 
	 * @returns {void}
	 */
	#renderBackgroundAt(position) {
		const context = this.#context;
		const state = this.#board.getStateAt(position);
		const gray = this.#gray;
		const darkgray = this.#darkgray;
		context.save();
		context.fillStyle = (state < 0
			? gray
			: darkgray
		).toString();
		context.strokeStyle = darkgray.toString();
		const scale = this.#scale;
		context.beginPath();
		context.rect(ceil(position.x * scale.x), ceil(position.y * scale.y), ceil(scale.x), ceil(scale.y));
		context.fill();
		context.stroke();
		context.restore();
	}
	/**
	 * @param {Readonly<Point2D>} position 
	 * @returns {void}
	 */
	#renderForegroundAt(position) {
		const context = this.#context;
		const state = this.#board.getStateAt(position);
		const green = this.#green;
		const yellow = this.#yellow;
		const red = this.#red;
		context.save();
		if (state > 0) {
			context.fillStyle = green.mix(red, state / Board.peakDanger).toString();
			this.#writeAt(position, state.toString());
		} else if (state === -2) {
			context.fillStyle = red.toString();
			this.#writeAt(position, `!`);
		} else if (state === -3) {
			context.fillStyle = yellow.toString();
			this.#writeAt(position, `?`);
		}
		context.restore();
	}
	/**
	 * @returns {void}
	 */
	#renderBoard() {
		const size = this.#board.size;
		for (let y = 0; y < size.y; y++) {
			for (let x = 0; x < size.x; x++) {
				const position = new Point2D(x, y);
				this.#renderBackgroundAt(position);
				this.#renderForegroundAt(position);
			}
		}
	}
	/**
	 * Renders the game board on the canvas.
	 * @returns {void}
	 */
	#renderChanges() {
		for (const position of this.#board.modifications.clear()) {
			this.#renderBackgroundAt(position);
			this.#renderForegroundAt(position);
		}
	}
	/**
	 * @returns {Promise<void>}
	 */
	async #renderImutable() {
		const modifications = this.#board.modifications;
		while (modifications.size > 0) {
			const locator = modifications.shift();
			let position = locator;
			do {
				this.#renderBackgroundAt(position);
				this.#renderForegroundAt(position);
				if (modifications.size === 0) break;
				position = modifications.shift();
			} while (position.x === locator.x);
			await Promise.withTimeout(100);
		}
	}
	/**
	 * Gets the area of the canvas under the mouse pointer.
	 * @param {MouseEvent} event The mouse event.
	 * @returns {Point2D} The position of the mouse on the canvas.
	 */
	#getMouseArea({ clientX, clientY }) {
		const { x, y } = this.#canvas.getBoundingClientRect();
		const scale = this.#scale;
		return new Point2D(trunc((clientX - x) / scale.x), trunc((clientY - y) / scale.y));
	}
	/**
	 * Checks if the game session is suspended.
	 * @param {boolean} already Whether the session is already suspended.
	 * @returns {Promise<boolean>} Whether the session is suspended.
	 */
	async #isSessionSuspended(already) {
		const board = this.#board;
		const isVictory = (board.outcome === OutcomeOptions.victory);
		const isSuspended = (isVictory || board.outcome === OutcomeOptions.defeat);
		if (isSuspended) {
			let message = `The session${(already ? ` already` : ``)} is ${(isVictory ? `won` : `lost`)}. Start a new one?`;
			if (!already) message = `${(isVictory ? `The board is neutralized.` : `The field blew up.`)}\n${message}`;
			if (await window.confirmAsync(message)) {
				board.rebuild();
				this.#renderBoard();
			}
		}
		return isSuspended;
	}
	/** @type {HTMLButtonElement} */
	#buttonOpenSettings;
	/** @type {HTMLDialogElement} */
	#dialogSettings;
	/**
	 * The main method to initialize and start the game.
	 * @returns {Promise<void>}
	 */
	async main() {
		this.#main = document.getElement(HTMLElement, `main`);

		const size = new Point2D(9, 9);
		const board = new Board(size, 10);
		this.#board = board;

		const canvas = document.getElement(HTMLCanvasElement, `canvas#display`);
		this.#canvas = canvas;
		this.#resizeCanvas();
		window.addEventListener(`resize`, (event) => this.#resizeCanvas());

		const context = canvas.getContext(`2d`);
		if (context === null) throw new EvalError(`Unable to get context`);
		this.#context = context;
		context.textBaseline = `alphabetic`;
		context.textAlign = `center`;
		context.lineCap = `round`;
		this.resizeContext();
		window.addEventListener(`resize`, (event) => this.resizeContext());
		this.#renderBoard();
		window.addEventListener(`resize`, (event) => this.#renderBoard());

		canvas.addEventListener(`click`, async (event) => {
			event.preventDefault();
			if (await this.#isSessionSuspended(true)) return;
			board.markFieldAt(this.#getMouseArea(event));
			this.#renderChanges();
			if (await this.#isSessionSuspended(false)) return;
		});
		canvas.addEventListener(`contextmenu`, async (event) => {
			event.preventDefault();
			if (await this.#isSessionSuspended(true)) return;
			board.digFieldAt(this.#getMouseArea(event));
			this.#renderChanges();
			if (await this.#isSessionSuspended(false)) return;
		});

		this.#buttonOpenSettings = document.getElement(HTMLButtonElement, `button#open-settings`);
		const buttonOpenSettings = this.#buttonOpenSettings;
		this.#dialogSettings = document.getElement(HTMLDialogElement, `dialog#settings`);
		const dialogSettings = this.#dialogSettings;
		dialogSettings.addEventListener(`click`, (event) => {
			if (event.target !== dialogSettings) return;
			dialogSettings.close();
		});
		buttonOpenSettings.addEventListener(`click`, (event) => {
			dialogSettings.showModal();
		});
	}
}
await window.load(window.ensure(() => new Controller().main()));
//#endregion
