"use strict";
try {
	//#region Database
	const database = [
		new Post(`Начало`, new Date(`2023-01-19 09:03`), `
			Начало моей персональной веб страницы.
		`, `event`),
		new Post(`Сертификат Musixmatch`, new Date(`2023-01-20 20:47`), `
			Получил сертификат академии в <a href="https://www.musixmatch.com/">Musixmatch</a><br>
			<img src="../resources/archive/Graduate Certificate.jpg" alt="Сертификат">
		`, `bounties image`),
		new Post(`Русская рулетка наоборот`, new Date(`2023-02-02 1:38`), `
			Предлагаю такую игру. Для начала <a href="https://www.google.com/search?q=%D0%BA%D0%B0%D0%BA+%D0%BE%D1%82%D0%BA%D1%80%D1%8B%D1%82%D1%8C+%D0%BA%D0%BE%D0%BD%D1%81%D0%BE%D0%BB%D1%8C+%D1%80%D0%B0%D0%B7%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%87%D0%B8%D0%BA%D0%B0">открывайте консоль разработчика</a>, потом нажмите на кнопку "Запустить" снизу. В открывшейся всплывающее поле вводите какую-нибудь фразу (не рекомендуется больше 8 слов), к примеру: "Берегите в себе человека.". Я наугад буду смешивать слова фразы и выводить в консоли. Игра заканчивается, когда смешанная фраза будет совпадать с оригиналом. После чего я покажу количество попыток.<br>
			Ну что, готов? :)<br>
			<button id="launch-mini-game-1" class="depth" style="display: block; margin: var(--size-gap) auto;">Запустить</button>
		`, `java-script mini-game`, true),
		new Post(`Игра в стиле песочница`, new Date(`2023-02-06 13:59`), `
			Моя игрушка на DOM перешла на новый уровень. Полную версию найдете в <a href="https://github.com/eccs0103/Elements">GitHub</a>. А пока можете взглянуть на <a href="https://eccs0103.github.io/Elements/">демо версию</a>.<br>
			<img src="../resources/archive/Elements.png" alt="Скриншот">
		`, `projects image`),
		new Post(`Музыкальный визуализатор`, new Date(`2023-02-24 19:41`), `
			Те, кто еще помнят, что я программист, удивлятся меньше, но я все таки попробую. 😄<br>
			Кратко говоря, создал прикольный визуализатор. Загружайте в него любую песню и посмотрите. Заодно скажите как вам.<br>
			Вот <a href="https://eccs0103.github.io/Visualizer/">ссылка</a>. Работает без проблем на Windows, Mac OS, Android, Linux, но IOS почему-то блокирует.<br>
			<img src="../resources/archive/Visualizer.png" alt="Скриншот">
		`, `projects image music`),
	];
	//#endregion
	//#region Filters
	const tags = new Set(Application.search.get(`tags`)?.split(`, `));
	/**
	 * @callback Filter
	 * @param {Post} post
	 * @param {Number} index
	 * @returns {Boolean}
	 */
	/** @type {Array<Filter>} */ const filters = [
		//#region Tag filter
		(post) => tags.size > 0 ? Array.from(tags).every(tag => post.tags.includes(tag)) : true,
		//#endregion
	];
	//#endregion
	//#region Initialize
	const main = document.querySelector(`main`);
	if (!main) {
		throw new ReferenceError(`Element 'main' isn't defined.`);
	}
	const templatePostStructure = (/** @type {HTMLTemplateElement} */ (document.querySelector(`template#post-structure`)));
	for (let index = database.length - 1; index >= 0; index--) {
		const post = database[index];
		if (filters.every(filter => filter(post, index))) {
			//#region Post
			const articlePost = main.appendChild((/** @type {HTMLElement} */ (/** @type {HTMLElement} */(templatePostStructure.content.querySelector(`article#post-`)).cloneNode(true))));
			articlePost.id = `post-${index}`;
			{
				//#region Post title
				const h1Title = (/** @type {HTMLHeadingElement} */ (articlePost.querySelector(`h1.title`)));
				h1Title.innerText = post.title;
				{ }
				//#endregion
				//#region Post date
				const timeDate = (/** @type {HTMLTimeElement} */ (articlePost.querySelector(`time.date`)));
				timeDate.dateTime = post.date.toString();
				timeDate.innerText = post.date.toLocaleString(undefined, {
					year: `numeric`,
					month: `numeric`,
					day: `numeric`,
					hourCycle: `h24`,
					hour: `2-digit`,
					minute: `2-digit`,
				});
				timeDate.role = `button`;
				timeDate.addEventListener(`click`, (event) => {
					navigator.clipboard.writeText(`${location.origin}${location.pathname}#${articlePost.id}`)
						.then(() => {
							window.alert(`Ссылка к посту скопирована.`);
						})
						.catch((reason) => {
							throw reason instanceof Error ? reason : new Error(reason);
						});
				});
				{ }
				//#endregion
				//#region Post container
				const divContainer = (/** @type {HTMLDivElement} */ (articlePost.querySelector(`div.container`)));
				{
					//#region Post content
					divContainer.innerHTML = post.content;
					{
						for (const image of divContainer.querySelectorAll(`img`)) {
							const a = divContainer.appendChild(document.createElement(`a`));
							a.href = image.src;
							a.target = `_blank`;
							a.appendChild(image);
						}
					}
					//#endregion
					//#region Post snippets
					if (post.snippets) {
						const script = divContainer.appendChild(document.createElement(`script`));
						script.defer = true;
						script.src = `../scripts/snippets/${articlePost.id}.js`;
					}
					//#endregion
				}
				//#endregion
				//#region Post tags
				const divTags = (/** @type {HTMLDivElement} */ (articlePost.querySelector(`div.tags`)));
				{
					post.tags.forEach((tag, index) => {
						const dfnTag = divTags.appendChild(document.createElement(`dfn`));
						dfnTag.innerText = tag;
						if (index != post.tags.length - 1) {
							dfnTag.replaceWith(dfnTag, document.createTextNode(`, `));
						}
						dfnTag.role = `button`;
						if (tags.has(tag)) {
							dfnTag.classList.add(`mark`);
						}
						dfnTag.addEventListener(`click`, (event) => {
							if (tags.has(tag)) {
								tags.delete(tag);
							} else {
								tags.add(tag);
							}
							if (tags.size > 0) {
								Application.search.set(`tags`, Array.from(tags).join(`, `));
							} else {
								Application.search.delete(`tags`);
							}
							location.search = Array.from(Application.search.entries()).map(([key, value]) => `${key}=${value}`).join(`&`);
						});
					});
				}
				//#endregion
			}
			//#endregion
		}
	}
	//#endregion
} catch (exception) {
	Application.prevent(exception);
}