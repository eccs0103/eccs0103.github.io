const main = document.querySelector(`main`);
if (!main) {
	throw new ReferenceError(`Element 'main' isn't defined.`);
}
const articlesPost = (/** @type {Array<HTMLElement>} */ (Array.from(main.querySelectorAll(`article.post`))));
for (let index = 0; index < articlesPost.length; index++) {
	const articlePost = articlesPost[(articlesPost.length - 1) - index];
	articlePost.id = `post-${index}`;
	const timeDate = (/** @type {HTMLTimeElement} */ (articlePost.querySelector(`time.date`)));
	const dateValue = Date.parse(timeDate.dateTime);
	timeDate.innerText = new Date(dateValue).toLocaleString(undefined, {
		year: `numeric`,
		month: `long`,
		day: `numeric`,
		hourCycle: `h24`,
		hour: `2-digit`,
		minute: `2-digit`,
	});
	if (!Number.isNaN(dateValue)) {
		timeDate.classList.add(`button`);
		timeDate.addEventListener(`click`, (event) => {
			navigator.clipboard.writeText(`${location.origin}${location.pathname}#${articlePost.id}`)
				.then(() => {
					window.alert(`Ссылка к посту скопирована.`);
				})
				.catch((reason) => {
					throw reason instanceof Error ? reason : new Error(reason);
				});
		});
	}
	const divTags = (/** @type {HTMLDivElement} */ (articlePost.querySelector(`div.tags`)));
	const dfnsTag = (/** @type {Array<HTMLElement>} */ (Array.from(divTags.querySelectorAll(`dfn`))));
	for (const dfnTag of dfnsTag) {
		// dfnTag.classList.add(`button`);
	}
}