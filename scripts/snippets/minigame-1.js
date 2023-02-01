"use strict";

const buttonLaunch = (/** @type {HTMLButtonElement} */ (document.querySelector(`button#launch-minigame-1`)));
buttonLaunch.addEventListener(`click`, async (event) => {
	const example = `Берегите в себе человека.`;
	let input = window.prompt(`Вводите фразу.`, example);
	while (!input) {
		if (input == null) {
			return;
		}
		input = window.prompt(`Фраза не должно быть пустой`, example);
	}
	console.clear();
	const words = input.split(/\s/g);
	const indexes = words.map((word, index) => index);

	let counter = 0;
	function generate() {
		const clone = Array.of(...indexes);
		counter++;
		return Promise.resolve(indexes.reduce((previous, current, index) => {
			return [...previous, clone.splice(Math.floor(Random.number(0, clone.length)), 1)[0]];
		}, new Array()));
	}

	let gen;
	do {
		gen = await generate();
		console.log(`${gen.map(index => words[index]).join(` `)}\n`);
	} while (!indexes.every((value, index) => value == gen[index]));
	console.warn(`Удалось с ${counter}-ого раза.`);
	buttonLaunch.innerText = `Ещё раз? :)`;
});