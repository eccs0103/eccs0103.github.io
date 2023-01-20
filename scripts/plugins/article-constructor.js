const main = document.querySelector(`main`);
if (!main) {
	throw new ReferenceError(`Element 'main' isn't defined.`);
}
const articles = main.querySelectorAll(`article`);
for (let index = 0; index < articles.length; index++) {
	const article = articles[(articles.length - 1) - index];
	article.id = `post-${index}`;
	const time = article.querySelector(`time`);
	if (!time) {
		throw new ReferenceError(`Element 'time' isn't defined.`);
	}
	time.classList.add(`button`);
	time.addEventListener(`click`, (event) => {
		navigator.clipboard.writeText(`${location.href}#${article.id}`)
			.then(() => {
				window.alert(`Ссылка к посту скопирована.`);
			})
			.catch((reason) => {
				throw reason instanceof Error ? reason : new Error(reason);
			});
	});
	time.innerText = new Date(time.dateTime).toLocaleString();
}