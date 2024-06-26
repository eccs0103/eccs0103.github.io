"use strict";

/** @typedef {import("./structure.js").SettingsNotation} SettingsNotation */

import { Point, Point2D } from "../../scripts/modules/measures.js";
import { Color } from "../../scripts/modules/palette.js";
import { ArchiveManager } from "../../scripts/modules/storage.js";
import { Board, OutcomeOptions, Settings } from "./structure.js";

const { trunc, ceil, min } = Math;

//#region Controller
/**
 * Represents the model controller.
 */
class Controller {
	/** @type {ArchiveManager<SettingsNotation, Settings>} */
	#managerSettings;
	/** @type {Board} */
	#board;
	/** @type {HTMLElement} */
	#main;
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
		context.textBaseline = `alphabetic`;
		context.textAlign = `center`;
		context.lineCap = `round`;
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
	async #renderChangesByColumn() {
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
				await this.#renderChangesByColumn();
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
	/** @type {HTMLInputElement} */
	#inputSizeTextbox;
	// /** @type {HTMLInputElement} */
	// #inputToggleInvertedControl;
	/**
	 * Performs initial setup and loads necessary resources before the main logic.
	 * @returns {Promise<void>}
	 */
	async awake() {
		this.#managerSettings = await ArchiveManager.construct(`${navigator.dataPath}.Settings`, Settings);

		const body = document.body;

		this.#main = body.getElement(HTMLElement, `main`);
		const main = this.#main;

		this.#canvas = main.getElement(HTMLCanvasElement, `canvas#display`);
		const canvas = this.#canvas;

		const context = canvas.getContext(`2d`);
		if (context === null) throw new EvalError(`Unable to get context`);
		this.#context = context;

		this.#buttonOpenSettings = body.getElement(HTMLButtonElement, `button#open-settings`);

		this.#dialogSettings = body.getElement(HTMLDialogElement, `dialog#settings`);
		const dialogSettings = this.#dialogSettings;

		this.#inputSizeTextbox = dialogSettings.getElement(HTMLInputElement, `input#size-textbox`);

		// this.#inputToggleInvertedControl = dialogSettings.getElement(HTMLInputElement, `input#toggle-inverted-control`);
	}
	/**
	 * Contains the main logic for the application.
	 * @returns {Promise<void>}
	 */
	async main() {
		const managerSettings = this.#managerSettings;

		const { boardSize, minesCount } = managerSettings.data;
		this.#board = new Board(boardSize, minesCount);
		const board = this.#board;

		const canvas = this.#canvas;
		this.#resizeCanvas();
		window.addEventListener(`resize`, (event) => this.#resizeCanvas());

		this.#svgField = await document.loadResource(`../../resources/icons/minesweeper/field.svg`);
		this.#svgDiggedField = await document.loadResource(`../../resources/icons/minesweeper/digged-field.svg`);
		this.#svgMine = await document.loadResource(`../../resources/icons/minesweeper/mine.svg`);
		this.#svgFlag = await document.loadResource(`../../resources/icons/minesweeper/flag.svg`);
		this.#svgUnknown = await document.loadResource(`../../resources/icons/minesweeper/unknown.svg`);

		const context = this.#context;
		this.#resizeContext();
		window.addEventListener(`resize`, (event) => this.#resizeContext());
		this.#renderBoard();
		window.addEventListener(`resize`, (event) => this.#renderBoard());

		canvas.addEventListener(`click`, async (event) => {
			event.preventDefault();
			if (await this.#isSessionSuspended(true)) return;

			const position = this.#getMouseArea(event);
			board.markFieldAt(position);
			board.digPerimeterAt(position);
			this.#renderChanges();

			if (await this.#isSessionSuspended(false)) return;
		});
		canvas.addEventListener(`contextmenu`, async (event) => {
			event.preventDefault();
			if (await this.#isSessionSuspended(true)) return;

			const position = this.#getMouseArea(event);
			board.digFieldAt(position);
			this.#renderChanges();

			if (await this.#isSessionSuspended(false)) return;
		});

		const buttonOpenSettings = this.#buttonOpenSettings;
		const dialogSettings = this.#dialogSettings;
		buttonOpenSettings.addEventListener(`click`, (event) => {
			dialogSettings.showModal();
		});
		dialogSettings.addEventListener(`click`, (event) => {
			if (event.target !== dialogSettings) return;
			dialogSettings.close();
		});

		const inputSizeTextbox = this.#inputSizeTextbox;
		inputSizeTextbox.value = `${board.size.x}, ${board.size.y}`;
		inputSizeTextbox.addEventListener(`change`, async (event) => {
			try {
				const match = /^\s*(\d+)\s*,\s*(\d+)\s*$/.exec(inputSizeTextbox.value);
				if (match === null) throw new SyntaxError(`Invalid syntax '${inputSizeTextbox.value}' for board size input`);
				const [, x, y] = match.map(part => Number(part));
				const size = new Point2D(x, y);
				if (!Point.isInteger(size)) throw new TypeError(`The size ${size} must be finite integer point`);
				board.size = size;
				this.#resizeCanvas();
				this.#resizeContext();
				this.#renderBoard();
				managerSettings.data.boardSize = size;
			} catch (error) {
				await window.warn(Error.generate(error).message);
				inputSizeTextbox.value = `${board.size.x}, ${board.size.y}`;
			}
		});

		// const inputToggleInvertedControl = this.#inputToggleInvertedControl;
		// inputToggleInvertedControl.checked = managerSettings.data.invertedControl;
		// inputToggleInvertedControl.addEventListener(`change`, (event) => {
		// 	managerSettings.data.invertedControl = inputToggleInvertedControl.checked;
		// });
	}
}
const controller = new Controller();
await window.ensure(() => controller.awake());
await window.ensure(() => window.load(controller.main()));
//#endregion
