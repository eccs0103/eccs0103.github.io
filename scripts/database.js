"use strict";
const database = [
	new Post(`Начало`, new Date(`2023-01-19 09:03`), `
		Начало моей персональной веб страницы.
	`, `event`),
	new Post(`Сертификат Musixmatch`, new Date(`2023-01-20 20:47`), `
		Получил сертификат академии в <a href="https://www.musixmatch.com/">Musixmatch</a></br>
		<img src="../resources/archive/Graduate Certificate.jpg" alt="Сертификат"/>
	`, `bounties photo`),
	new Post(`Русская рулетка наоборот`, new Date(`2023-02-02 1:38`), `
		Предлагаю такую игру. Для начала <a href="https://www.google.com/search?q=%D0%BA%D0%B0%D0%BA+%D0%BE%D1%82%D0%BA%D1%80%D1%8B%D1%82%D1%8C+%D0%BA%D0%BE%D0%BD%D1%81%D0%BE%D0%BB%D1%8C+%D1%80%D0%B0%D0%B7%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%87%D0%B8%D0%BA%D0%B0">открывайте консоль разработчика</a>, потом нажмите на кнопку "Запустить" снизу. В открывшейся всплывающее поле вводите какую-нибудь фразу (не рекомендуется больше 8 слов), к примеру: "Берегите в себе человека.". Я наугад буду смешивать слова фразы и выводить в консоле. Игра заканчивается когда смешанная фраза будет совпадать с оригиналом. После чего я покажу количество попыток.<br/>
		Ну что, готов? :)<br/>
		<button id="launch-minigame-1" class="depth" style="display: block; margin: var(--size-gap) auto;">Запустить</button>
	`, `java-script mini-game`),
];