const queryDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
if (queryDarkScheme.matches) {
	// Theme set to dark.
} else {
	// Theme set to light.
}
queryDarkScheme.addEventListener(`change`, (event) => {

});