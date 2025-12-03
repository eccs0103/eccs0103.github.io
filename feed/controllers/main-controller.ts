"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { Activity, GitHubCreateBranchActivity, GitHubCreateRepositoryActivity, GitHubCreateTagActivity, GitHubPushActivity, GitHubWatchActivity, SpotifyLikeActivity } from "../models/activity.js";
import database from "../data/activity.json";
import { ArrayCursor } from "../services/array-cursor.js";

//#region Main controller
class MainController extends Controller {
	async run(): Promise<void> {
		const mainFeedContainer = await document.getElementAsync(HTMLElement, "main#feed-container");
		const spanFooterYear = await document.getElementAsync(HTMLSpanElement, "span#footer-year");

		const name = "activity";
		const activities = Object.freeze(Array.import(database, name).map((item, index) => {
			return Activity.import(item, `${name}[${index}]`);
		}));
		const cursor = new ArrayCursor(activities);

		let limit = 5;
		while (cursor.inRange) {
			if (limit <= 0) break;
			const activity = cursor.target;


			if (activity instanceof GitHubPushActivity) {
				const divActivityLog = mainFeedContainer.appendChild(document.createElement("div"));
				divActivityLog.classList.add("layer", "rounded", "with-padding");

				const timeActivityDate = divActivityLog.appendChild(document.createElement("time"));
				timeActivityDate.dateTime = activity.timestamp.toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" });
				timeActivityDate.style.fontSize = "small";
				timeActivityDate.style.justifySelf = "end";
				timeActivityDate.textContent = timeActivityDate.dateTime;

				const spanActivityDescription = divActivityLog.appendChild(document.createElement("span"));

				let begin = cursor.index;
				while (cursor.inRange) {
					const next = cursor.target;
					if (!(next instanceof GitHubPushActivity)) break;
					if (activity.repository !== next.repository) break;
					cursor.index++;
				}
				spanActivityDescription.textContent = `Pushed ${cursor.index - begin} times to the ${activity.repository} repository.`;
				cursor.index--;
			}
			if (activity instanceof GitHubWatchActivity) {
				const divActivityLog = mainFeedContainer.appendChild(document.createElement("div"));
				divActivityLog.classList.add("layer", "rounded", "with-padding");

				const timeActivityDate = divActivityLog.appendChild(document.createElement("time"));
				timeActivityDate.dateTime = activity.timestamp.toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" });
				timeActivityDate.style.fontSize = "small";
				timeActivityDate.style.justifySelf = "end";
				timeActivityDate.textContent = timeActivityDate.dateTime;

				const spanActivityDescription = divActivityLog.appendChild(document.createElement("span"));
				spanActivityDescription.textContent = `Started following the ${activity.repository} repository.`;
			}
			if (activity instanceof GitHubCreateTagActivity) {
				const divActivityLog = mainFeedContainer.appendChild(document.createElement("div"));
				divActivityLog.classList.add("layer", "rounded", "with-padding");

				const timeActivityDate = divActivityLog.appendChild(document.createElement("time"));
				timeActivityDate.dateTime = activity.timestamp.toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" });
				timeActivityDate.style.fontSize = "small";
				timeActivityDate.style.justifySelf = "end";
				timeActivityDate.textContent = timeActivityDate.dateTime;

				const spanActivityDescription = divActivityLog.appendChild(document.createElement("span"));
				spanActivityDescription.textContent = `Created tag ${activity.name} in repository ${activity.repository}.`;
			}
			if (activity instanceof GitHubCreateBranchActivity) {
				const divActivityLog = mainFeedContainer.appendChild(document.createElement("div"));
				divActivityLog.classList.add("layer", "rounded", "with-padding");

				const timeActivityDate = divActivityLog.appendChild(document.createElement("time"));
				timeActivityDate.dateTime = activity.timestamp.toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" });
				timeActivityDate.style.fontSize = "small";
				timeActivityDate.style.justifySelf = "end";
				timeActivityDate.textContent = timeActivityDate.dateTime;

				const spanActivityDescription = divActivityLog.appendChild(document.createElement("span"));
				spanActivityDescription.textContent = `Created branch ${activity.name} in repository ${activity.repository}.`;
			}
			if (activity instanceof GitHubCreateRepositoryActivity) {
				const divActivityLog = mainFeedContainer.appendChild(document.createElement("div"));
				divActivityLog.classList.add("layer", "rounded", "with-padding");

				const timeActivityDate = divActivityLog.appendChild(document.createElement("time"));
				timeActivityDate.dateTime = activity.timestamp.toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" });
				timeActivityDate.style.fontSize = "small";
				timeActivityDate.style.justifySelf = "end";
				timeActivityDate.textContent = timeActivityDate.dateTime;

				const spanActivityDescription = divActivityLog.appendChild(document.createElement("span"));
				spanActivityDescription.textContent = `Created repository '${activity.name}'.`;
			}
			if (activity instanceof SpotifyLikeActivity) {
				// 1. Создаем контейнер
				const div = mainFeedContainer.appendChild(document.createElement("div"));
				div.classList.add("layer", "rounded", "with-padding", "flex", "alt-center", "with-gap");

				// 2. Картинка (Обложка)
				const img = div.appendChild(document.createElement("img"));
				img.src = activity.imageUrl; // <-- Твое поле с картинкой
				img.alt = activity.trackName;
				img.classList.add("rounded");
				// Лучше вынести в style.css класс .album-art { width: 4rem; height: 4rem; object-fit: cover; }
				img.style.width = "4rem";
				img.style.height = "4rem";
				img.style.objectFit = "cover";

				// 3. Текстовый блок
				const infoDiv = div.appendChild(document.createElement("div"));
				infoDiv.classList.add("flex", "column");
				infoDiv.style.flex = "1"; // Занимать оставшееся место
				infoDiv.style.minWidth = "0"; // Для корректной работы text-overflow

				// Название
				const titleSpan = infoDiv.appendChild(document.createElement("span"));
				titleSpan.textContent = activity.trackName;
				titleSpan.style.fontWeight = "bold";

				// Артист
				const artistSpan = infoDiv.appendChild(document.createElement("span"));
				artistSpan.textContent = activity.artistName;
				artistSpan.style.opacity = "0.7";
				artistSpan.style.fontSize = "small";

				// 4. Ссылка (делаем всю карточку кликабельной или отдельную кнопку)
				// Вариант с отдельной ссылкой:
				const link = infoDiv.appendChild(document.createElement("a"));
				link.href = activity.url;
				link.target = "_blank";
				link.textContent = "Listen on Spotify ↗";
				link.style.color = "#1DB954"; // Spotify Green
				link.style.fontSize = "small";
				link.style.marginTop = "0.25rem";

				// 5. Время (как у остальных)
				const time = div.appendChild(document.createElement("time"));
				// ... твой код для времени ...
			}
			limit--;
			cursor.index++;
		}

		spanFooterYear.textContent = String(new Date().getFullYear());
	}
}
//#endregion

await MainController.launch();
