const database = [
	new Post(`Начало`, new Date(`2023-01-19 09:03`), `
		Начало моей персональной веб страницы.
	`, `event`),
	new Post(`Пара классов`, new Date(`2023-01-19 09:36`), `
	<p>Написал пару полезных классов на Java Script, хотел оставить у себя в странице.</p>
	<code class="depth" style="	display: flex; flex-direction: column; padding: var(--size-gap); overflow-x: auto;">
		<span>//#region Random</span>
		<span>/**</span>
		<span> * A class that manages with randomness.</span>
		<span> */</span>
		<span>class Random {</span>
		<span>	/**</span>
		<span>	 * Gives a random number between min and max exclusively.</span>
		<span>	 * @param {Number} min A minimum value.</span>
		<span>	 * @param {Number} max A maximum value.</span>
		<span>	 * @returns A random float float.</span>
		<span>	 */</span>
		<span>	static number(min, max) {</span>
		<span>		return Math.random() * (max - min) + min;</span>
		<span>	}</span>
		<span>	/**</span>
		<span>	 * Gives a random element from an array.</span>
		<span>	 * @template Type Elements type.</span>
		<span>	 * @param {Array<Type>} array Given array.</span>
		<span>	 * @returns An array element.</span>
		<span>	 */</span>
		<span>	static element(array) {</span>
		<span>		return array[Math.floor(Random.number(0, array.length))];</span>
		<span>	}</span>
		<span>	/**</span>
		<span>	 * A function that returns random variant from cases.</span>
		<span>	 * @template Type Case type.</span>
		<span>	 * @param {Map&lt;Type, Number&gt;} cases Map of cases.</span>
		<span>	 * @returns Random case.</span>
		<span>	 */</span>
		<span>	static case(cases) {</span>
		<span>		const summary = Array.from(cases).reduce((previous, current) => previous + current[1], 0);</span>
		<span>		const random = Random.number(0, summary);</span>
		<span>		let selection = undefined;</span>
		<span>		let start = 0;</span>
		<span>		for (const entry of cases) {</span>
		<span>			const end = start + entry[1];</span>
		<span>			if (start &lt;= random && random &lt; end) {</span>
		<span>				selection = entry[0];</span>
		<span>				break;</span>
		<span>			}</span>
		<span>			start = end;</span>
		<span>		}</span>
		<span>		if (typeof (selection) == \`undefined\`) {</span>
		<span>			throw new ReferenceError(\`Can't select value. Maybe stack is empty.\`);</span>
		<span>		} else {</span>
		<span>			return selection;</span>
		<span>		}</span>
		<span>	}</span>
		<span>}</span>
		<span>//#endregion</span>
		<span>//#region Archive</span>
		<span>/**</span>
		<span> * A class for convenient data storage in local storage.</span>
		<span> * @template Notation Data type stored in archive.</span>
		<span> */</span>
		<span>class Archive {</span>
		<span>	/**</span>
		<span>	 * @param {String} path The path where the data should be stored.</span>
		<span>	 * @param {Notation?} initial Initial data.</span>
		<span>	 */</span>
		<span>	constructor(path, initial = null) {</span>
		<span>		this.#path = path;</span>
		<span>		if (!localStorage.getItem(path) && initial) {</span>
		<span>			localStorage.setItem(path, JSON.stringify(initial, undefined, \`\t\`));</span>
		<span>		}</span>
		<span>	}</span>
		<span>	/** @type {String} */ #path;</span>
		<span>	/**</span>
		<span>	 * The data stored in the archive.</span>
		<span>	 */</span>
		<span>	get data() {</span>
		<span>		const item = localStorage.getItem(this.#path);</span>
		<span>		if (item) {</span>
		<span>			return (/** @type {Notation} */ (JSON.parse(item)));</span>
		<span>		} else {</span>
		<span>			throw new ReferenceError(\`Key '\${this.#path}' is undefined.\`);</span>
		<span>		}</span>
		<span>	}</span>
		<span>	/**</span>
		<span>	 * The data stored in the archive.</span>
		<span>	 */</span>
		<span>	set data(value) {</span>
		<span>		localStorage.setItem(this.#path, JSON.stringify(value, undefined, \`\t\`));</span>
		<span>	}</span>
		<span>	/**</span>
		<span>	 * Function for receiving and transmitting data. Frequent use is not recommended based on optimization.</span>
		<span>	 * @param {(value: Notation) => Notation} action A function that transforms the results.</span>
		<span>	 */</span>
		<span>	change(action) {</span>
		<span>		this.data = action(this.data);</span>
		<span>	}</span>
		<span>}</span>
		<span>//#endregion</span>
	</code>
	`, `code java-script`),
	new Post(`Сертификат Musixmatch`, new Date(`2023-01-20 20:47`), `
		<p>Получил сертификат академии в <a href="https://www.musixmatch.com/">Musixmatch</a></p>
		<img src="../resources/Graduate Certificate.jpg" alt="Сертификат">
	`, `bounties photo`),
];