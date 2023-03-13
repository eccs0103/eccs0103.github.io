try {
	let preferences = Preferences.import(archivePreferences.data);
	window.addEventListener(`beforeunload`, (event) => {
		archivePreferences.data = Preferences.export(preferences);
	});
	document.documentElement.dataset[`theme`] = preferences.theme;
	//#region Theme
	const selectDropdownTheme = (/** @type {HTMLSelectElement} */ (document.querySelector(`select#dropdown-theme`)));
	Preferences.themes.forEach((theme) => {
		const option = selectDropdownTheme.appendChild(document.createElement(`option`));
		option.value = theme;
		option.innerText = (() => {
			switch (theme) {
				case `system`: return `Системная`;
				case `light`: return `Светлая`;
				case `dark`: return `Темная`;
				default: throw new TypeError(`Invalid `);
			}
		})();
	});
	selectDropdownTheme.value = preferences.theme;
	selectDropdownTheme.addEventListener(`change`, (event) => {
		preferences.theme = selectDropdownTheme.value;
		document.documentElement.dataset[`theme`] = preferences.theme;
	});
	//#endregion
} catch (exception) {
	Application.prevent(exception);
}