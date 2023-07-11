const { MessageActionRow, MessageButton } = require("discord.js");

function validateWeekInterval(weekInterval) {
	// Si l'utilisateur n'a pas spécifié l'intervalle, de base on laisse à 1 (toutes les semaines)
	if (weekInterval == null) {
		return 1;
	} else {
		// Vérifie que le week interval est un entier supérieur ou égal à 1
		if (Number.isInteger(weekInterval) && weekInterval >= 1) {
			return weekInterval;
		} else {
			return {
				error:
					"The week interval you provided is wrong. It should be an integer greater than or equal to 1.",
			};
		}
	}
}

// Fonction pour vérifier la validité des jours entrés par l'utilisateur
function validateDays(input) {
	const days = [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12",
		"13",
		"14",
		"15",
		"16",
		"17",
		"18",
		"19",
		"20",
		"21",
		"22",
		"23",
		"24",
		"25",
		"26",
		"27",
		"28",
		"29",
		"30",
		"31",
	];

	// Si l'utilisateur n'a pas spécifié le paramètre days, alors on renvoie un tableau contenant l'élément "ALL" indiquant que cela va s'effectuer tous les jours
	if (input == null) {
		return ["ALL"];
	}
	// Si l'utilisateur a spécifié vouloir tous les jours en entrant "ALL"
	if (input.toUpperCase() == "ALL") {
		return ["ALL"];
	}
	// Divise la chaîne d'entrée par des virgules et supprime les espaces blancs
	const daysArray = input.split(",").map((day) => day.trim().toUpperCase());

	// Vérifie les doublons
	const duplicates = daysArray.filter(
		(day, index) => daysArray.indexOf(day) !== index
	);
	if (duplicates.length > 0) {
		return {
			error:
				"The format of the days you sent is wrong, there are duplicates. The format should be like this: **day, anotherday** (Example: 1, 21). Just put **ALL** if you want all days to be taken.",
		};
	}

	// Vérifie si tous les jours sont valides
	const invalidDays = daysArray.filter((day) => !days.includes(day));
	if (invalidDays.length > 0) {
		return {
			error:
				"The format of the days you sent is wrong, there are invalid days found. The format should be like this: **day, anotherday** (Example: 1, 21). Just put **ALL** if you want all days to be taken.",
		};
	}

	// Trie les jours par ordre croissant
	const sortedDays = daysArray.sort(
		(a, b) => days.indexOf(a) - days.indexOf(b)
	);

	return sortedDays;
}

// Fonction pour vérifier la validité des mois entrés par l'utilisateur ainsi que des jours où commencer
function validateMonths(monthsInput, startMonthDayInput, weekInterval) {
	// If week interval had an error before, just don't do anything, an error about week interval will be shown
	if (weekInterval.hasOwnProperty("error")) {
		return "Week interval issue.";
	}

	const months = [
		"JANUARY",
		"FEBRUARY",
		"MARCH",
		"APRIL",
		"MAY",
		"JUNE",
		"JULY",
		"AUGUST",
		"SEPTEMBER",
		"OCTOBER",
		"NOVEMBER",
		"DECEMBER",
	];

	const startDays = ["1", "2", "3", "4", "5"];

	// Vérifie si l'utilisateur n'a seulement entré le paramètre startMonthDay
	if (monthsInput == null && startMonthDayInput != null) {
		return {
			error:
				"Please don't provide the startMonthDay option if you are not specifying the months.",
		};
	}
	// Si l'utilisateur n'a pas spécifié le paramètre months, alors on renvoie un tableau contenant l'élément "ALL" indiquant que cela va s'effectuer tous les mois
	if (monthsInput == null) {
		return [{ month: "ALL", startDay: null }];
	}
	// Si l'utilisateur a spécifié vouloir tous les mois en entrant "ALL"
	if (monthsInput.toUpperCase() == "ALL") {
		// Vérifie que l'utilisateur n'a pas entré l'option startMonthDay
		if (startMonthDayInput == null) {
			return [{ month: "ALL", startDay: null }];
		} else {
			return {
				error:
					"Please don't provide the startMonthDay option if you want to select all months.",
			};
		}
	}
	// Vérifie que l'utilisateur a entré l'option startMonthDay si l'intervalle est supérieure à 1
	if (weekInterval > 1 && startMonthDayInput == null) {
		return {
			error:
				"Since you specified months and a week interval greater than 1, you must also provide the startMonthDay of each month. For that, fulfill the corresponding parameter with numbers ranging from 1 to 5 (where 1 means the first day of the week of the month, e.g the first sunday of the month) for each month you put, all separated by commas. If you specify three month, you will then have to put three integers for example.",
		};
	}
	// Vérifie que l'utilisateur n'a pas entré l'option startMonthDay si l'intervalle est égale à 1
	if (weekInterval == 1 && startMonthDayInput != null) {
		return {
			error:
				"Please don't provide the startMonthDay option if you are using a week interval of 1 (each week taken into account).",
		};
	}

	let monthsArray;

	if (weekInterval > 1) {
		// Vérifie que le nombre de month est égal au nombre de startMonthDay
		if (monthsInput.split(",").length != startMonthDayInput.split(",").length) {
			return {
				error:
					"Please provide the same number of months than of startMonthDay. Please take care of the order you want.",
			};
		}

		// Divise la chaîne d'entrée par des virgules et supprime les espaces blancs, puis map à un tableau d'objets
		monthsArray = monthsInput.split(",").map((month, index) => ({
			month: month.trim().toUpperCase(),
			startDay: parseInt(startMonthDayInput.split(",")[index].trim(), 10), // Parse to integer
		}));

		// Vérifie si tous les startMonthDay sont valides
		const invalidStartMonthDays = monthsArray.filter(
			(month) => !startDays.includes(String(month.startDay)) // Convert to string for comparison
		);
		if (invalidStartMonthDays.length > 0) {
			return {
				error:
					"The format of the startMonthDay you sent is wrong. The format should be like this: **startmonthday, anotherstartmonthday** (Example: 1, 2). Values are ranging from 1 to 5.",
			};
		}
	} else {
		// Divise la chaîne d'entrée par des virgules et supprime les espaces blancs, puis map à un tableau d'objets
		monthsArray = monthsInput
			.split(",")
			.map((month) => ({ month: month.trim().toUpperCase(), startDay: null }));
	}

	// Vérifie les doublons
	const duplicates = monthsArray.filter(
		(month, index) =>
			monthsArray.findIndex((m) => m.month === month.month) !== index
	);
	if (duplicates.length > 0) {
		return {
			error:
				"The format of the months you sent is wrong, there are duplicates. The format should be like this: **month, anothermonth** (Example: January, September). Just put **ALL** if you want all months to be taken.",
		};
	}

	// Vérifie si tous les mois sont valides
	const invalidMonths = monthsArray.filter(
		(month) => !months.includes(month.month)
	);
	if (invalidMonths.length > 0) {
		return {
			error:
				"The format of the months you sent is wrong, there are invalid months found. The format should be like this: **month, anothermonth** (Example: January, September). Just put **ALL** if you want all months to be taken.",
		};
	}

	// Trie les mois par ordre croissant de janvier à décembre
	monthsArray.sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));

	return monthsArray;
}

// Fonction pour vérifier qu'une chaîne de caractère est une date valide au format YYYY-MM-DD
function isValidDate(dateString) {
	// Analyse la chaîne d'entrée et crée un nouvel objet Date
	const date = new Date(dateString);

	// Vérifie si la date analysée est une date valide et que le format de chaîne correspond à YYYY-MM-DD
	if (
		!isNaN(date.getTime()) &&
		/^\d{4}-\d{2}-\d{2}$/.test(dateString) &&
		date.toISOString().slice(0, 10) === dateString
	) {
		return true;
	}

	return false;
}

// Fonction pour vérifier la validité des jours de la semaine entrés par l'utilisateur
function validateDaysOfWeek(
	daysOfWeekInput,
	startTimeInput,
	monthsInput,
	timeZone
) {
	const daysOfWeek = [
		"SUNDAY",
		"MONDAY",
		"TUESDAY",
		"WEDNESDAY",
		"THURSDAY",
		"FRIDAY",
		"SATURDAY",
	];

	if (monthsInput != null && startTimeInput != null) {
		if (monthsInput.toUpperCase() != "ALL") {
			return {
				error:
					'Please don\'t provide the startTime option if you are specifying months other than "ALL" with the months option. Use the startMonthDay option instead.',
			};
		}
	}

	// Si l'utilisateur n'a pas rempli l'option startTime, alors on utilise la date actuelle par rapport à sa time zone
	if (startTimeInput == null) {
		// Si l'utilisateur a rempli l'option des mois, on ne peut pas utiliser le startTime
		if (monthsInput != null) {
			startTime = null;
		} else {
			startTime = getCurrentDatetimeWithTimeZone(timeZone);
		}
	} else {
		// Vérifie si la date est valide
		if (startTimeInput != null && isValidDate(startTimeInput) == false) {
			return {
				error:
					"The format of the startTime you sent is wrong. The format should be like this: **YYYY-MM-DD** (Example: 2023-09-20).",
			};
		} else {
			startTime = startTimeInput;
		}
	}

	// Si l'utilisateur n'a pas spécifié le paramètre daysOfWeek, alors on renvoie un tableau contenant l'élément "ALL" indiquant que cela va s'effectuer tous les jours de la semaine
	if (daysOfWeekInput == null) {
		return { daysArray: ["ALL"], startTime: startTime };
	}
	// Si l'utilisateur a spécifié vouloir tous les jours de la semaine en entrant "ALL"
	if (daysOfWeekInput.toUpperCase() == "ALL") {
		return { daysArray: ["ALL"], startTime: startTime };
	}

	// Divise la chaîne d'entrée par des virgules et supprime les espaces blancs
	const daysArray = daysOfWeekInput
		.split(",")
		.map((day) => day.trim().toUpperCase());

	// Vérifie les doublons
	const duplicates = daysArray.filter(
		(day, index) => daysArray.indexOf(day) !== index
	);
	if (duplicates.length > 0) {
		return {
			error:
				"The format of the days of week you sent is wrong, there are duplicates. The format should be like this: **weekday, anotherweekday** (Example: Monday, Wednesday). Just put **ALL** if you want all days of the week to be taken.",
		};
	}

	// Vérifie si tous les jours sont valides
	const invalidDays = daysArray.filter((day) => !daysOfWeek.includes(day));
	if (invalidDays.length > 0) {
		return {
			error:
				"The format of the days of week you sent is wrong, there are invalid days of the week found. The format should be like this: **weekday, anotherweekday** (Example: Monday, Wednesday). Just put **ALL** if you want all days of the week to be taken.",
		};
	}

	// Trie les jours de la semaine par ordre croissant de dimanche à samedi
	daysArray.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));

	return { daysArray: daysArray, startTime: startTime };
}

// Fonction pour convertir les jours
function convertDays(daysArray) {
	if (daysArray.length === 1 && daysArray[0] === "ALL") {
		return "*";
	}

	return daysArray.join(",");
}

// Fonction pour convertir les mois en nombres
function convertMonthsToNumbers(monthsArray) {
	// Check if user specified all months
	if (monthsArray.length === 1 && monthsArray[0].month === "ALL") {
		return {
			monthsToNumbers: "*",
			startDays: null,
		};
	}

	const monthMap = {
		JANUARY: 0,
		FEBRUARY: 1,
		MARCH: 2,
		APRIL: 3,
		MAY: 4,
		JUNE: 5,
		JULY: 6,
		AUGUST: 7,
		SEPTEMBER: 8,
		OCTOBER: 9,
		NOVEMBER: 10,
		DECEMBER: 11,
	};

	const monthsToNumbersArray = monthsArray.map(
		(month) => monthMap[month.month]
	);
	const startDayArray = monthsArray.map((month) => month.startDay);

	// Return string of comma separated values
	return {
		monthsToNumbers: monthsToNumbersArray.join(","),
		startDays: startDayArray.join(","),
	};
}

// Fonction pour convertir les jours de la semaine en nombres
function convertDaysOfWeekToNumbers(daysArray) {
	if (daysArray.length === 1 && daysArray[0] === "ALL") {
		return "*";
	}

	const dayMap = {
		SUNDAY: 0,
		MONDAY: 1,
		TUESDAY: 2,
		WEDNESDAY: 3,
		THURSDAY: 4,
		FRIDAY: 5,
		SATURDAY: 6,
	};

	const numbersArray = daysArray.map((day) => dayMap[day]);

	return numbersArray.join(",");
}

// Fonction pour vérifier que la timezone entrée est valide
function isValidTimeZone(tz) {
	// Si l'utilisateur n'a pas spécifié le paramètre timeZone, alors on renvoie de base la time zone Europe/Paris
	if (tz == null) {
		return "Europe/Paris";
	}

	if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
		throw new Error("Time zones are not available in this environment");
	}

	try {
		Intl.DateTimeFormat(undefined, { timeZone: tz });
		return tz;
	} catch (ex) {
		return false;
	}
}

// Fonction pour récupérer la date actuelle en fonction de la time zone envoyée
function getCurrentDatetimeWithTimeZone(timeZone) {
	// Le datetime actuel pour la timezone concernée
	let currentDatetime = new Date().toLocaleString("en-US", {
		timeZone: timeZone,
	});

	// Création d'un nouvel objet Date en utilisant le datetime
	let date = new Date(currentDatetime);

	// Récupération de l'année (YYYY)
	let year = date.getFullYear();
	// Récupération du mois (MM)
	let month = ("0" + (date.getMonth() + 1)).slice(-2);
	// Récupération du jour (DD)
	let day = ("0" + date.getDate()).slice(-2);

	// Conversion de la datetime au format YYYY-MM-DD
	currentDatetime = year + "-" + month + "-" + day;

	return currentDatetime;
}

// Fonction pour vérifier si au moins un jour spécifié est égal au jour actuel
function isCurrentDayOfMonth(dayNumbers, timeZone) {
	// Récupère la date actuelle pour le fuseau horaire spécifié
	let currentDatetime = getCurrentDatetimeWithTimeZone(timeZone);

	// Convertis la chaîne de caractères de nombres en tableau
	let dayNumbersArray = dayNumbers.split(",");

	// Extrait le jour de la date actuelle
	let currentDay = parseInt(currentDatetime.split("-")[2], 10);

	// Boucle sur tous les jours envoyés
	for (let dayNumber of dayNumbersArray) {
		dayNumber = parseInt(dayNumber.trim(), 10);
		// Compare le jour actuel avec le numéro de jour donné
		if (currentDay === dayNumber) {
			return true;
		}
	}
	// Si aucun nombre n'est égal au jour actuel, retourne false
	return false;
}

// Fonction pour récupérer la date pour le jour, mois et année donnée sur une certaine occurence
function getSpecificDayOfMonth(year, month, targetDay, occurrence) {
	// Crée un nouvel objet Date pour l'année et le mois spécifié
	let date = new Date(year, month, 1);

	// Obtenir le jour de la semaine pour le premier jour du mois
	let dayOfWeek = date.getDay();

	// Calcule le nombre de jours jusqu'au jour cible
	let daysToTargetDay = (7 + targetDay - dayOfWeek) % 7;

	// Calcule les jours supplémentaires en fonction de l'occurrence spécifiée
	let additionalDays = (occurrence - 1) * 7;

	// Ajuste la date au jour cible
	date.setDate(1 + daysToTargetDay + additionalDays);

	// Récupération des composants année, mois et jour de la date
	let yearStr = date.getFullYear().toString();
	let monthStr = (date.getMonth() + 1).toString().padStart(2, "0");
	let dayStr = date.getDate().toString().padStart(2, "0");

	// Renvoie la date au format YYYY-MM-DD
	return yearStr + "-" + monthStr + "-" + dayStr;
}

// Fonction pour vérifier si l'envoi du message doit être effectué
function checkIfGoodMonthAndWeekForMessage(
	monthsData,
	daysOfWeekNumbers,
	weekInterval,
	timeZone
) {
	// Récupère la date actuelle pour le fuseau horaire spécifié
	let currentDatetime = getCurrentDatetimeWithTimeZone(timeZone);

	// Extrait l'année de la date actuelle
	let currentYear = parseInt(currentDatetime.split("-")[0], 10);
	// Extrait le mois de la date actuelle (-1 car on représente Janvier à Décembre de 0 à 11)
	let currentMonth = parseInt(currentDatetime.split("-")[1], 10) - 1;

	// Convertis la chaîne de caractères des mois nombres en tableau
	let monthNumbersArray = monthsData.monthsToNumbers.split(",");
	// Convertis la chaîne de caractères des startDays en tableau
	let startDaysArray = monthsData.startDays.split(",");
	// Convertis la chaîne de caractères des daysOfWeek en tableau
	let daysOfWeekNumbersArray = daysOfWeekNumbers.split(",");

	// Boucle dans le tableau des numéros de mois
	for (let i = 0; i < monthNumbersArray.length; i++) {
		let monthNumber = parseInt(monthNumbersArray[i].trim(), 10);
		let startDay = parseInt(startDaysArray[i].trim(), 10);

		// Compare le mois actuel avec le numéro de mois donné
		if (currentMonth === monthNumber) {
			// Boucle sur tous les jours spécifiés
			for (let j = 0; j < daysOfWeekNumbersArray.length; j++) {
				let startDayOccurence = startDay;
				let targetDay = parseInt(daysOfWeekNumbersArray[j].trim(), 10);

				// A day can be maxiumum seen 5 times a month
				while (startDayOccurence <= 5) {
					// On récupère la date pour le jour, mois et année donnée sur une l'occurence actuelle
					let dayOfMonth = getSpecificDayOfMonth(
						currentYear,
						currentMonth,
						targetDay,
						startDayOccurence
					);

					// Si le jour actuel correspond à la bonne semaine du mois
					if (currentDatetime == dayOfMonth) {
						return true;
					}
					// Sinon on incrémente l'occurence par le l'intervalle de semaine
					else {
						startDayOccurence += weekInterval;
					}
				}
			}
		}
	}

	// Si aucun nombre n'est égal au mois actuel, retourne false
	return false;
}

// Fonction pour vérifier si le message doit s'envoyer sur la semaine actuelle
function checkWeekInterval(initialDate, actualDate, weekInterval) {
	// Transforme les chaînes de caractères en dates
	initialDate = new Date(initialDate);
	actualDate = new Date(actualDate);

	// Vérifie que la date d'aujourd'hui est supérieure ou égale à la date de début
	if (actualDate >= initialDate) {
		// Convertis les dates en UTC pour éviter les problèmes de fuseau horaire
		const utc1 = Date.UTC(
			initialDate.getFullYear(),
			initialDate.getMonth(),
			initialDate.getDate()
		);
		const utc2 = Date.UTC(
			actualDate.getFullYear(),
			actualDate.getMonth(),
			actualDate.getDate()
		);

		// Calcule la différence en millisecondes
		const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
		const timeDiff = Math.abs(utc2 - utc1);

		// Calcule le nombre de semaines
		const weeks = Math.floor(timeDiff / millisecondsPerWeek);

		// Vérifie si le message peut s'envoyer sur la semaine actuelle
		if (weeks % weekInterval == 0) {
			return true;
		} else {
			return false;
		}
	}
}

async function pagination(interaction, pages) {
	// Crée un MessageActionRow avec des boutons pour la pagination
	const components = [
		new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId("prev")
				.setLabel("Previous")
				.setStyle("PRIMARY")
				.setEmoji("⬅️"),
			new MessageButton()
				.setCustomId("next")
				.setLabel("Next")
				.setStyle("PRIMARY")
				.setEmoji("➡️"),
			new MessageButton()
				.setCustomId("delete")
				.setLabel("Delete")
				.setStyle("DANGER")
				.setEmoji("🗑️")
		),
	];

	let currentPageIndex = 0;

	const data = {
		// Définit l'intégration initiale sur la première page
		embeds: [pages[currentPageIndex]],
		// Inclut les composants (boutons) dans la réponse d'interaction
		components: components,
		fetchReply: true,
	};

	const msg = await interaction.reply(data);

	const collector = msg.createMessageComponentCollector({
		filter: (i) => i.user.id === interaction.user.id,
		time: 120000, // 2 minutes de timer avant la fin
	});

	collector.on("collect", async (i) => {
		if (i.customId === "prev") {
			// L'utilisateur a cliqué sur le bouton "Précédent"
			currentPageIndex--;
		} else if (i.customId === "next") {
			// L'utilisateur a cliqué sur le bouton "Suivant"
			currentPageIndex++;
		} else if (i.customId === "delete") {
			// L'utilisateur a cliqué sur le bouton "Supprimer"
			// Vérification que le message existe
			if (msg.deletable) {
				await msg.delete();
			}
			return;
		}

		// Gère les pages (si on appuie sur précédent en étant sur le premier, alors on va à la dernière page et inversement)
		if (currentPageIndex < 0) {
			currentPageIndex = pages.length - 1;
		} else if (currentPageIndex >= pages.length) {
			currentPageIndex = 0;
		}

		// Met à jour la réponse d'interaction avec la nouvelle page
		await i.update({
			embeds: [pages[currentPageIndex]],
		});
	});

	collector.on("end", async () => {
		// Vérification que le message existe
		if (msg.deletable) {
			// Supprime le message à la fin du timer
			await msg.delete();
		}
		// Supprime les boutons
		// await msg.edit({
		// 	components: [],
		// });
	});
}

module.exports = {
	validateWeekInterval,
	validateDays,
	validateMonths,
	validateDaysOfWeek,
	convertDays,
	convertMonthsToNumbers,
	convertDaysOfWeekToNumbers,
	isValidTimeZone,
	getCurrentDatetimeWithTimeZone,
	isCurrentDayOfMonth,
	checkIfGoodMonthAndWeekForMessage,
	checkWeekInterval,
	pagination,
};
