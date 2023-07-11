const { Guild } = require("../models/index");
const CronJobManager = require("cron-job-manager");
const ObjectId = require("mongodb").ObjectId;
const {
	convertDays,
	convertMonthsToNumbers,
	convertDaysOfWeekToNumbers,
	getCurrentDatetimeWithTimeZone,
	isCurrentDayOfMonth,
	checkIfGoodMonthAndWeekForMessage,
	checkWeekInterval,
} = require("./tools");

// Création du manager des CRON
let cronJobManager = new CronJobManager();

// Fonction qui vérifie si un nouveau CRON a été créé pour l'activer
const checkForCRON = async (Client) => {
	// Récupérer tous les serveurs de la base de données
	const findResults = await Guild.find();

	// Boucler sur tous les serveurs récupérés
	for (const post of findResults) {
		const guildId = post._id;
		const crons = post.crons;

		const guild = await Client.guilds.fetch(guildId);
		if (!guild) {
			continue;
		}

		// Boucler sur tous les CRON du serveur
		for (const cronData of crons) {
			const {
				time,
				days,
				months,
				daysOfWeek,
				message,
				channelId,
				weekInterval,
				startTime,
				timeZone,
				isActive,
				_id,
			} = cronData;
			const channel = guild.channels.cache.get(channelId);

			// Si le channel n'existe pas, on continue la boucle
			if (!channel) {
				continue;
			}

			// Récupérer les minutes et heures
			let hours = time.split(":")[0];
			let minutes = time.split(":")[1];

			// Convertis le tableau en chaîne de caractères pour le cronjob
			let daysConverted = convertDays(days);

			// Convertis les mois en leurs nombres correspondants pour le cronjob
			let monthsData = convertMonthsToNumbers(months);

			// Convertis les jours de la semaine en leurs nombres correspondants pour le cronjob
			let daysOfWeekToNumbers = convertDaysOfWeekToNumbers(daysOfWeek);

			// Si le CRON n'est pas actif, on l'active
			if (isActive == false) {
				/*
				Le premier champ représente les secondes.
				Le deuxième champ représente les minutes.
				Le troisième champ représente les heures.
				Le quatrième champ représente le jour du mois (1 - 31).
				Le cinquième champ représente le mois (0 - 11), où janvier est 0 et dimanche est 11
				Le sixième champ représente le jour de la semaine, où dimanche est 0 et samedi est 6.
				*/
				cronJobManager.add(
					`${guildId}_${ObjectId(_id).toString()}`,
					`1 ${minutes} ${hours} ${daysConverted} ${monthsData.monthsToNumbers} ${daysOfWeekToNumbers}`,
					function () {
						// On récupère le datetime actuel en utilisant la timezone spécifiée
						let currentDatetime = getCurrentDatetimeWithTimeZone(timeZone);

						// Variable pour vérifier si le message a été envoyé
						let isMessageSent = false;

						// Si l'intervalle hebdomadaire est égal à 1, il n'y a pas de vérification à faire hormis par rapport au startTime
						if (weekInterval == 1) {
							if (startTime != null) {
								// Transforme les chaînes de caractères en dates
								let initialDate = new Date(startTime);
								let actualDate = new Date(currentDatetime);
								// Vérifie que la date d'aujourd'hui est  supérieure ou égale à la date de début
								if (actualDate >= initialDate) {
									channel.send(message);
								}
							} else {
								channel.send(message);
							}
						}
						// Si l'intervalle hebdomadaire est supérieur à 1, des vérifications doivent être effectuées pour s'assurer que les messages sont envoyés lors des bonnes semaines
						else {
							// Vérifie si le jour actuel correspond à un jour spécifié (afin de différencier avec "daysOfWeek"), auquel cas on envoie le message dans tous les cas
							if (daysConverted != "*") {
								if (isCurrentDayOfMonth(daysConverted, timeZone) == true) {
									channel.send(message);
									isMessageSent = true;
								}
							}
							// Vérifie si la semaine du mois actuel correspond aux paramètres saisis par l'utilisateur
							if (monthsData.monthsToNumbers != "*") {
								if (
									checkIfGoodMonthAndWeekForMessage(
										monthsData,
										daysOfWeekToNumbers,
										weekInterval,
										timeZone
									) == true
								) {
									// Vérification si le message n'a pas déjà été envoyé pour ne pas le mettre en double
									if (isMessageSent == false) {
										channel.send(message);
									}
								}
							} else {
								// On vérifie s'il est possible d'envoyer le message sur la semaine actuelle par rapport au startTime
								let shouldMessageBeSent = checkWeekInterval(
									startTime,
									currentDatetime,
									weekInterval
								);

								// On envoie le message si la semaine est la bonne
								if (shouldMessageBeSent == true) {
									// Vérification si le message n'a pas déjà été envoyé pour ne pas le mettre en double
									if (isMessageSent == false) {
										channel.send(message);
									}
								}
							}
						}
					},
					{
						start: true,
						timeZone: timeZone,
					}
				);

				// On actualise le statut du CRON en actif
				await Guild.updateOne(
					{ _id: guildId, "crons._id": _id },
					{ $set: { "crons.$.isActive": true } }
				);
			}
		}
	}

	// Toutes les 10 secondes, on rappelle cette même fonction pour vérifier si de nouveaux CRON ont été créé pour ainsi les activer
	setTimeout(checkForCRON, 1000 * 10, Client);
};

module.exports = { cronJobManager, checkForCRON };
