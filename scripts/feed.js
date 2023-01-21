const main = document.querySelector(`main`);
if (!main) {
	throw new ReferenceError(`Element 'main' isn't defined.`);
}
const templatePostStructure = (/** @type {HTMLTemplateElement} */ (document.querySelector(`template#post-structure`)));
database.forEach((post, index) => {
	const articlePost = main.appendChild((/** @type {HTMLElement} */ (/** @type {HTMLElement} */(templatePostStructure.content.querySelector(`article#post-`)).cloneNode(true))));
	articlePost.id = `post-${index}`;
	{
		const h1Title = (/** @type {HTMLHeadingElement} */ (articlePost.querySelector(`h1#title`)));
		h1Title.innerText = post.title;
		{ }
		const timeDate = (/** @type {HTMLTimeElement} */ (articlePost.querySelector(`time#date`)));
		timeDate.dateTime = post.date.toString();
		timeDate.innerText = post.date.toLocaleString(undefined, {
			year: `numeric`,
			month: `long`,
			day: `numeric`,
			hourCycle: `h24`,
			hour: `2-digit`,
			minute: `2-digit`,
		});
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
		{ }
		const divContent = (/** @type {HTMLDivElement} */ (articlePost.querySelector(`div#content`)));
		divContent.innerHTML = post.content;
		{ }
		const divTags = (/** @type {HTMLDivElement} */ (articlePost.querySelector(`div#tags`)));
		{
			post.tags.forEach((tag, index) => {
				const dfnTag = divTags.appendChild(document.createElement(`dfn`));
				dfnTag.innerText = tag;
			});
		}
	}
});