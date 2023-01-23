try {
	const main = document.querySelector(`main`);
	if (!main) {
		throw new ReferenceError(`Element 'main' isn't defined.`);
	}
	const filters = (/** @type {Array<(post: Post, index: Number) => Boolean>} */ ([
		(post, index) => {
			const search = location.search.match(/tags=(.*)(,|$)/);
			if (search) {
				const tags = search[1].split(`,`);
				return tags.some(tag => post.tags.includes(tag));
			} else {
				return true;
			}
		}
	]));
	const templatePostStructure = (/** @type {HTMLTemplateElement} */ (document.querySelector(`template#post-structure`)));
	database.forEach((post, index) => {
		if (filters.every(filter => filter(post, index))) {
			const articlePost = main.appendChild((/** @type {HTMLElement} */ (/** @type {HTMLElement} */(templatePostStructure.content.querySelector(`article#post-`)).cloneNode(true))));
			articlePost.id = `post-${index}`;
			{
				const h1Title = (/** @type {HTMLHeadingElement} */ (articlePost.querySelector(`h1.title`)));
				h1Title.innerText = post.title;
				{ }
				const timeDate = (/** @type {HTMLTimeElement} */ (articlePost.querySelector(`time.date`)));
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
				const divContent = (/** @type {HTMLDivElement} */ (articlePost.querySelector(`div.content`)));
				divContent.innerHTML = post.content;
				{ }
				const divTags = (/** @type {HTMLDivElement} */ (articlePost.querySelector(`div.tags`)));
				{
					post.tags.forEach((tag, index) => {
						const dfnTag = divTags.appendChild(document.createElement(`dfn`));
						dfnTag.innerText = tag;
						if (index != post.tags.length - 1) {
							dfnTag.replaceWith(dfnTag, document.createTextNode(`, `));
						}
						dfnTag.classList.add(`button`);
						const search = location.search.match(/tags=(.*)(,|$)/);
						const tags = new Set(search ? search[1].split(`,`) : []);
						if (tags.has(tag)) {
							dfnTag.classList.add(`mark`);
						}
						dfnTag.addEventListener(`click`, (event) => {
							if (tags.has(tag)) {
								tags.delete(tag);
							} else {
								tags.add(tag);
							}
							location.search = tags.size == 0 ? `` : `tags=${Array.from(tags).join(`,`)}`;
						});
					});
				}
			}
		}
	});
} catch (error) {
	if (safeMode) {
		window.alert(error instanceof Error ? error.stack ?? `${error.name}: ${error.message}` : `Invalid exception type.`);
	} else console.error(error);
}