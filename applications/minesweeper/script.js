"use strict";

import { Queue } from "../../scripts/modules/extensions.js";
import { Random } from "../../scripts/modules/generators.js";
import { Matrix, Point, Point2D } from "../../scripts/modules/measures.js";
import { Color } from "../../scripts/modules/palette.js";
import { ArchiveManager } from "../../scripts/modules/storage.js";
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
 * @typedef {Queue<Readonly<Point2D>>} Area
 */

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
	 * Checks if the given size and mine count are compatible with the game board.
	 * @param {Readonly<Point2D>} size The size of the board.
	 * @param {number} count The number of mines.
	 * @returns {boolean} True if the size and mine count are compatible, otherwise false.
	 * @throws {TypeError} If the x or y coordinate of the size is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the size is less than 1.
	 * @throws {RangeError} If the number of fields is less than the peak value of the danger in the board.
	 * @throws {TypeError} If count is not a finite integer.
	 * @throws {RangeError} If count is less than 0.
	 */
	static areCompatible(size, count) {
		if (!Point.isInteger(size)) throw new TypeError(`The size ${size} must be finite integer point`);
		if (size.x < 1 || size.y < 1) throw new RangeError(`The size ${size} is out of range [(1, 1) - (+∞, +∞))`);
		const surface = size.x * size.y;
		const maxCount = surface - Board.peakDanger;
		if (maxCount < 0) throw new RangeError(`With current perimeter the board must have minimum ${Board.peakDanger} fields`);

		if (!Number.isInteger(count)) throw new TypeError(`The count ${count} must be finite integer number`);
		if (count < 0) throw new RangeError(`The count ${count} is out of range [0 - +∞)`);
		return (count <= maxCount);
	}
	/**
	 * Creates a board with the given size and mine count.
	 * @param {Readonly<Point2D>} size The size of the board.
	 * @param {number} count The number of mines.
	 * @throws {TypeError} If the x or y coordinate of the size is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the size is less than 1.
	 * @throws {RangeError} If the number of fields is less than the peak value of the danger in the board.
	 * @throws {TypeError} If count is not a finite integer.
	 * @throws {RangeError} If count is less than 0 or greater than the number of fields.
	 */
	constructor(size, count) {
		if (!Point.isInteger(size)) throw new TypeError(`The size ${size} must be finite integer point`);
		if (size.x < 1 || size.y < 1) throw new RangeError(`The size ${size} is out of range [(1, 1) - (+∞, +∞))`);
		const surface = size.x * size.y;
		const maxCount = surface - Board.peakDanger;
		if (maxCount < 0) throw new RangeError(`With current perimeter the board must have minimum ${Board.peakDanger} fields`);
		this.#size = size;

		if (!Number.isInteger(count)) throw new TypeError(`The count ${count} must be finite integer number`);
		if (count < 0 || count > maxCount) throw new RangeError(`The count ${count} is out of range [0 - ${maxCount}]`);
		this.#count = count;

		this.#matrix = new Matrix(size, (position) => new Field(0));
		this.#isInitialized = false;
		this.#modifications = new Queue();
		this.#outcome = OutcomeOptions.unknown;
		this.#counter = surface - count;
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
	 * @param {Readonly<Point2D>} position 
	 * @returns {Point2D[]}
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
	 * @param {Readonly<Point2D>} point 
	 * @returns {number}
	 */
	#toNumber(point) {
		const size = this.#size;
		return point.y * size.x + point.x;
	}
	/**
	 * @param {number} number 
	 * @returns {Point2D}
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
	 * Gets the current outcome of the game.
	 * @readonly
	 * @returns {OutcomeOptions}
	 */
	get outcome() {
		return this.#outcome;
	}
	/**
	 * @param {Readonly<Point2D>} position 
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
	/** @type {Queue<Area>} */
	#modifications;
	/**
	 * Gets the queue of modificated areas.
	 * @readonly
	 * @returns {Queue<Area>}
	 */
	get modifications() {
		return this.#modifications;
	}
	/**
	 * @returns {void}
	 */
	#onSuspend() {
		const area = new Queue();
		const size = this.#size;
		for (let x = 0; x < size.x; x++) {
			for (let y = 0; y < size.y; y++) {
				const position = new Point2D(x, y);
				const field = this.#matrix.get(position);
				if (field.privacy === Privacy.opened) continue;
				this.#tryDigField(field);
				area.push(position);
			}
		}
		this.#modifications.push(area);
	}
	/**
	 * @param {boolean} successful 
	 * @returns {void}
	 */
	#checkOutcomeConditions(successful) {
		if (successful) {
			if (this.#counter > 0) return;
			if (this.#outcome === OutcomeOptions.unknown) {
				this.#outcome = OutcomeOptions.victory;
				this.#onSuspend();
			}
		} else {
			if (this.#outcome === OutcomeOptions.unknown) {
				this.#outcome = OutcomeOptions.defeat;
				this.#onSuspend();
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

		this.#matrix = new Matrix(size, (position) => new Field(0));
		this.#isInitialized = false;
		this.#modifications.clear();
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
			return true;
		} catch (error) {
			if (!(error instanceof EvalError)) throw error;
			if (error.message !== `The field blew up`) throw error;
			return false;
		}
	}
	/**
	 * @param {Readonly<Point2D>} position 
	 * @param {Area} area 
	 * @returns {boolean}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	#tryDigFieldAt(position, area) {
		if (!this.#isInitialized) this.#initialize(position);
		const field = this.#matrix.get(position);
		if (field.privacy !== Privacy.unmarked) return true;
		let isSuccessful = this.#tryDigField(field);
		this.#counter--;
		area.push(position);
		if (field.danger === 0) {
			for (const location of this.#getPerimetersAt(position)) {
				if (!this.#tryDigFieldAt(location, area)) {
					isSuccessful = false;
				}
			}
		}
		return isSuccessful;
	}
	/**
	 * Opens the field at the specified position.
	 * @param {Readonly<Point2D>} position The position of the field.
	 * @returns {void}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	digFieldAt(position) {
		const area = new Queue();
		const isSuccessful = this.#tryDigFieldAt(position, area);
		this.#modifications.push(area);
		this.#checkOutcomeConditions(isSuccessful);
	}
	/**
	 * 
	 * @param {Readonly<Point2D>} position 
	 * @param {Area} area 
	 * @returns {boolean}
	 */
	#tryMarkOpenedFieldAt(position, area) {
		const field = this.#matrix.get(position);
		const danger = field.danger;
		let marks = 0;
		const unmarked = [];
		for (const location of this.#getPerimetersAt(position)) {
			const neighbour = this.#matrix.get(location);
			switch (neighbour.privacy) {
				case Privacy.marked:
				case Privacy.unknown: marks++;
				case Privacy.opened: break;
				default: {
					unmarked.push(location);
				} break;
			}
		}
		if (marks !== danger) return true;
		let isSuccessful = true;
		for (const location of unmarked) {
			if (!this.#tryDigFieldAt(location, area)) isSuccessful = false;
		}
		return isSuccessful;
	}
	/**
	 * Marks the field at the specified position.
	 * @param {Readonly<Point2D>} position The position of the field.
	 * @returns {void}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	markFieldAt(position) {
		const area = new Queue();
		let isSuccessful = true;
		const field = this.#matrix.get(position);
		switch (field.privacy) {
			case Privacy.opened: {
				isSuccessful = this.#tryMarkOpenedFieldAt(position, area);
			} break;
			case Privacy.unmarked:
			case Privacy.marked:
			case Privacy.unknown: {
				field.privacy = (/** @type {Privacy} */ (trunc(field.privacy % 3) + 1));
				area.push(position);
			} break;
			default: throw new TypeError(`Invalid privacy ${field.privacy} state for field at ${position}`);
		}
		this.#modifications.push(area);
		this.#checkOutcomeConditions(isSuccessful);
	}
};
//#endregion
//#region Settings
/**
 * @typedef {Object} SettingsNotation
 * @property {number} [boardWidth]
 * @property {number} [boardHeight]
 * @property {number} [minesCount]
 * @property {boolean} [invertedControl]
 */

class Settings {
	/**
	 * @param {unknown} source 
	 * @returns {Settings}
	 */
	static import(source, name = `source`) {
		try {
			const shell = Object.import(source);
			const boardWidth = Number.import(shell[`boardWidth`], `property boardWidth`);
			const boardHeight = Number.import(shell[`boardHeight`], `property boardHeight`);
			const boardSize = Object.freeze(new Point2D(boardWidth, boardHeight));
			if (!Point.isInteger(boardSize)) throw new TypeError(`The size ${boardSize} must be finite integer point`);
			if (boardSize.x < 1 || boardSize.y < 1) throw new RangeError(`The size ${boardSize} is out of range [(1, 1) - (+∞, +∞))`);
			const minesCount = Number.import(shell[`minesCount`], `property minesCount`);
			if (!Number.isInteger(minesCount)) throw new TypeError(`The mines count ${minesCount} must be finite integer number`);
			if (minesCount < 0) throw new RangeError(`The mines count ${minesCount} is out of range [0 - +∞)`);
			const invertedControl = Boolean.import(shell[`invertedControl`], `property invertedControl`);
			const result = new Settings();
			result.boardSize = boardSize;
			result.minesCount = minesCount;
			result.invertedControl = invertedControl;
			return result;
		} catch (error) {
			throw new TypeError(`Unable to import ${(name)} due its ${typename(source)} type`, { cause: error });
		}
	}
	/**
	 * @returns {SettingsNotation}
	 */
	export() {
		return {
			boardWidth: this.boardSize.x,
			boardHeight: this.boardSize.y,
			minesCount: this.minesCount,
			invertedControl: this.invertedControl,
		};
	}
	/** @type {Readonly<Point2D>} */
	#boardSize = Object.freeze(Point2D.repeat(9));
	/**
	 * @returns {Readonly<Point2D>}
	 */
	get boardSize() {
		return this.#boardSize;
	}
	/**
	 * @param {Readonly<Point2D>} value 
	 * @returns {void}
	 */
	set boardSize(value) {
		if (!Board.areCompatible(value, this.#minesCount)) throw new RangeError(`Size ${value} is too small for count ${this.#minesCount}. It must contain minimum ${this.#minesCount + Board.peakDanger} fields`);
		this.#boardSize = value;
	}
	/** @type {number} */
	#minesCount = 10;
	/**
	 * @returns {number}
	 */
	get minesCount() {
		return this.#minesCount;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set minesCount(value) {
		if (!Board.areCompatible(this.#boardSize, value)) throw new RangeError(`Count ${value} is too large for size ${this.#boardSize}. It can contain maximum ${this.#boardSize.x * this.#boardSize.y - Board.peakDanger} mines`);
		this.#minesCount = value;
	}
	/** @type {boolean} */
	#invertedControl = true;
	/**
	 * @returns {boolean}
	 */
	get invertedControl() {
		return this.#invertedControl;
	}
	/**
	 * @param {boolean} value 
	 * @returns {void}
	 */
	set invertedControl(value) {
		this.#invertedControl = value;
	}
}
//#endregion
//#region Controller
/**
 * Represents the model controller.
 */
class Controller {
	/** @type {ArchiveManager<SettingsNotation, Settings>} */
	#managerSettings;
	/** @type {HTMLElement} */
	#main;
	/** @type {Board} */
	#board;
	/** @type {HTMLCanvasElement} */
	#canvas;
	/** @type {Point2D} */
	#scale;
	/**
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
	#resizeContext() {
		const context = this.#context;
		const scale = this.#scale;
		context.font = `900 ${scale.y / 2}px monospace`;
		context.lineWidth = min(scale.x, scale.y) >> 5;
	}
	/**
	 * @param {Readonly<Point2D>} position 
	 * @param {string} text 
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
	/**
	 * @param {Readonly<Point2D>} position 
	 * @param {CanvasImageSource} image 
	 */
	#drawAt(position, image) {
		const context = this.#context;
		const scale = this.#scale;
		context.drawImage(image,
			ceil(position.x * scale.x),
			ceil(position.y * scale.y),
			ceil(scale.x),
			ceil(scale.y)
		);
	}
	/** @type {HTMLImageElement} */
	#svgField;
	/** @type {HTMLImageElement} */
	#svgDiggedField;
	/**
	 * @param {Readonly<Point2D>} position 
	 * @returns {void}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	#renderBackgroundAt(position) {
		this.#drawAt(position, (this.#board.getStateAt(position) < 0
			? this.#svgField
			: this.#svgDiggedField
		));
	}
	/** @type {Color[]} */
	#colors = [
		Color.TRANSPARENT,
		Color.viaRGB(0, 0, 255),
		Color.viaRGB(0, 128, 0),
		Color.viaRGB(255, 0, 0),
		Color.viaRGB(0, 0, 139),
		Color.viaRGB(128, 0, 0),
		Color.viaRGB(0, 255, 255),
		Color.viaRGB(128, 0, 128),
		Color.viaRGB(128, 128, 128),
	];
	/** @type {HTMLImageElement} */
	#svgMine;
	/** @type {HTMLImageElement} */
	#svgFlag;
	/** @type {HTMLImageElement} */
	#svgUnknown;
	/**
	 * @param {Readonly<Point2D>} position 
	 * @returns {void}
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	#renderForegroundAt(position) {
		const context = this.#context;
		const state = this.#board.getStateAt(position);
		if (state === Board.peakDanger) {
			this.#drawAt(position, this.#svgMine);
		} else if (0 < state && state < Board.peakDanger) {
			context.save();
			context.fillStyle = this.#colors[state].toString();
			this.#writeAt(position, state.toString());
			context.restore();
		} else if (state === -2) {
			this.#drawAt(position, this.#svgFlag);
		} else if (state === -3) {
			this.#drawAt(position, this.#svgUnknown);
		}
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
	 * @returns {void}
	 */
	#renderChanges() {
		const modifications = this.#board.modifications;
		if (modifications.size < 1) return;
		for (const position of modifications.shift()) {
			this.#renderBackgroundAt(position);
			this.#renderForegroundAt(position);
		}
	}
	/**
	 * @returns {Promise<void>}
	 */
	async #renderByColumn() {
		const modifications = this.#board.modifications;
		if (modifications.size < 1) return;
		const area = modifications.shift();
		while (area.size > 0) {
			const anchor = area.peek;
			while (true) {
				const position = area.peek;
				if (position.x !== anchor.x) break;
				this.#renderBackgroundAt(position);
				this.#renderForegroundAt(position);
				area.shift();
				if (area.size < 1) break;
			}
			await Promise.withTimeout(100);
		}
	}
	/**
	 * @param {MouseEvent} event 
	 * @returns {Point2D}
	 */
	#getMouseArea({ clientX, clientY }) {
		const { x, y } = this.#canvas.getBoundingClientRect();
		const scale = this.#scale;
		return new Point2D(
			trunc((clientX - x) / scale.x),
			trunc((clientY - y) / scale.y)
		);
	}
	/**
	 * @param {boolean} already 
	 * @returns {Promise<boolean>}
	 */
	async #isSessionSuspended(already) {
		const board = this.#board;
		const isVictory = (board.outcome === OutcomeOptions.victory);
		const isSuspended = (isVictory || board.outcome === OutcomeOptions.defeat);
		if (isSuspended) {
			if (!already) {
				await this.#renderByColumn();
			}
			let message = `The session${(already ? ` already` : ``)} is ${(isVictory ? `won` : `lost`)}. Start a new one?`;
			if (!already) message = `${(isVictory ? `The board is neutralized.` : `The field blew up.`)}\n${message}`;
			if (await window.confirmAsync(message, isVictory ? `Victory` : `Defeat`)) {
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
	 * @returns {Promise<void>}
	 */
	async awake() {
		this.#managerSettings = await ArchiveManager.construct(`${navigator.dataPath}.Settings`, Settings);
	}
	/**
	 * The main method to initialize and start the game.
	 * @returns {Promise<void>}
	 */
	async main() {
		this.#main = document.getElement(HTMLElement, `main`);

		const size = this.#managerSettings.data.boardSize;
		const board = new Board(size, this.#managerSettings.data.minesCount);
		this.#board = board;

		const canvas = document.getElement(HTMLCanvasElement, `canvas#display`);
		this.#canvas = canvas;
		this.#resizeCanvas();
		window.addEventListener(`resize`, (event) => this.#resizeCanvas());

		this.#svgField = await document.loadResource(`../../resources/icons/minesweeper/field.svg`);
		this.#svgDiggedField = await document.loadResource(`../../resources/icons/minesweeper/digged-field.svg`);
		this.#svgMine = await document.loadResource(`../../resources/icons/minesweeper/mine.svg`);
		this.#svgFlag = await document.loadResource(`../../resources/icons/minesweeper/flag.svg`);
		this.#svgUnknown = await document.loadResource(`../../resources/icons/minesweeper/unknown.svg`);

		const context = canvas.getContext(`2d`);
		if (context === null) throw new EvalError(`Unable to get context`);
		this.#context = context;
		context.textBaseline = `alphabetic`;
		context.textAlign = `center`;
		context.lineCap = `round`;
		this.#resizeContext();
		window.addEventListener(`resize`, (event) => this.#resizeContext());
		this.#renderBoard();
		window.addEventListener(`resize`, (event) => this.#renderBoard());

		const invertedControl = this.#managerSettings.data.invertedControl;
		canvas.addEventListener(`click`, async (event) => {
			event.preventDefault();
			if (await this.#isSessionSuspended(true)) return;
			if (invertedControl) board.markFieldAt(this.#getMouseArea(event));
			else board.digFieldAt(this.#getMouseArea(event));
			this.#renderChanges();
			if (await this.#isSessionSuspended(false)) return;
		});
		canvas.addEventListener(`contextmenu`, async (event) => {
			event.preventDefault();
			if (await this.#isSessionSuspended(true)) return;
			if (invertedControl) board.digFieldAt(this.#getMouseArea(event));
			else board.markFieldAt(this.#getMouseArea(event));
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
const controller = new Controller();
await window.ensure(() => controller.awake());
await window.load(window.ensure(() => controller.main()));
//#endregion
