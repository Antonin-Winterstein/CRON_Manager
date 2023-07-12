const { Guild } = require("../../models/index");
const DiscordJS = require("discord.js");
const ObjectId = require("mongodb").ObjectId;
const CronJobManager = require("../../utils/cronJobManager");
const checkIfGuildExists = require("../../utils/checkIfGuildExists");
const {
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
} = require("../../utils/tools");

module.exports = {
	name: "updatecron",
	category: "cron",
	description:
		"Updates the selected CRON using its identifier if at least one optional option is filled.",
	permissions: ["ADMINISTRATOR"],
	usage:
		"updatecron [identifier] <channel> <time> <message> <days> <months> <daysOfWeek> <weekInterval> <startTime> <startMonthDay> <timeZone>",
	examples: [
		"updatecron [622ea01f78ef802465cda7d4] <yourchannel> <09:21> <Hello World!> <1, 10, 21> <January, September> <Monday, Wednesday> <2> <1, 2> <Europe/Paris>",
		"updatecron [622ea01f78ef802465cda7d4] <yourchannel> <09:21> <Hello World!> <ALL> <ALL> <ALL> <2> <2023-09-20>",
		"updatecron [622ea01f78ef802465cda7d4] <yourchannel> <09:21> <Hello World!",
		"updatecron [622ea01f78ef802465cda7d4] <yourchannel> <09:21>",
		"updatecron [622ea01f78ef802465cda7d4] <Hello World!>",
	],
	options: [
		{
			name: "id",
			description:
				"The Id of the CRON that you can find using `showallcron` command.",
			required: true,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "channel",
			description: "The channel in which the message will be sent.",
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.CHANNEL,
			channel_types: [DiscordJS.Constants.ChannelTypes.GUILD_TEXT],
		},
		{
			name: "time",
			description: "The time when the message will be sent. (format: HH:mm)",
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "message",
			description: "The message you want to send.",
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "days",
			description:
				'Separate each day you want by commas or put "ALL". If not specified, it will be sent every day.',
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "months",
			description:
				'Separate each month you want by commas or put "ALL". If not specified, it will be sent every month.',
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "daysofweek",
			description:
				'Separate each day of the week by commas or put "ALL". If not specified, it will be sent every day.',
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "weekinterval",
			description:
				"The interval of weeks the message will be sent. By default, it is set to 1 (sent every week).",
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.INTEGER,
		},
		{
			name: "starttime",
			description:
				"The date to start from (format: YYYY-MM-DD). Current date by default.",
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "startmonthday",
			description:
				"Specify start days of each month (1-5 comma separated) if weekInterval is > than 1 and months used.",
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "timezone",
			description:
				"The time zone you want the message to be sent from. By default it is set to Europe/Paris.",
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
	],
	async runInteraction(Client, interaction) {
		// Récupération des données envoyées par l'utilisateur
		const sentId = interaction.options.getString("id");
		let sentChannel = interaction.options.getChannel("channel");
		let sentTime = interaction.options.getString("time");
		let sentMessage = interaction.options.getString("message");
		let sentDays = interaction.options.getString("days");
		let sentMonths = interaction.options.getString("months");
		let sentDaysOfWeek = interaction.options.getString("daysofweek");
		let sentWeekInterval = interaction.options.getInteger("weekinterval");
		let sentStartTime = interaction.options.getString("starttime");
		let sentStartMonthDay = interaction.options.getString("startmonthday");
		let sentTimeZone = interaction.options.getString("timezone");

		// Si le format de l'ID est respecté
		if (sentId.match(/^[0-9a-fA-F]{24}$/)) {
			const guild = await Client.guilds.fetch(interaction.guildId);

			// Si on n'arrive pas à récupérer l'Id du serveur, on affiche une erreur à l'utilisateur
			if (!guild) {
				interaction.reply({
					content:
						"An error occured trying to get your server Id. Please contact the creator.",
					ephemeral: true,
				});
			} else {
				// On récupère les données du serveur en question
				const findResults = await Guild.find({
					_id: interaction.guildId,
				});

				await checkIfGuildExists.checkIfGuildExists(findResults, interaction);

				// On récupère les données pour l'Id du CRON envoyé par l'utilisateur sur son serveur
				const findOneResults = await Guild.findOne(
					{ _id: interaction.guildId },
					{ crons: { $elemMatch: { _id: sentId } } }
				);
				const cron = findOneResults.crons;

				// Si on récupère le CRON
				if (typeof cron !== "undefined" && cron.length > 0) {
					// On récupère les données
					for (const cronData of cron) {
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

						// Si aucun champ facultatif n'a été saisi, on indique à l'utilisateur qu'il n'y a pas eu de modifications
						if (
							sentChannel === null &&
							sentTime === null &&
							sentMessage === null &&
							sentDays === null &&
							sentMonths === null &&
							sentDaysOfWeek === null &&
							sentWeekInterval === null &&
							sentStartTime === null &&
							sentStartMonthDay === null &&
							sentTimeZone === null
						) {
							interaction.reply({
								content:
									"The CRON hasn't been modified since you haven't filled any fields.",
								ephemeral: true,
							});
							return;
						} else {
							// Regex qui permet de respecter le format HH:MM
							let timeRegex = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$";

							if (sentTime != null && sentTime.match(timeRegex) == null) {
								// On indique que le format n'est pas le bon
								interaction.reply({
									content:
										"The format of the time you sent is wrong, it should be like this: **HH:mm** (Example: 09:21)",
									ephemeral: true,
								});
								return;
							}

							// Si la longueur maximale du message n'est pas respectée
							if (sentMessage != null && sentMessage.length > 2000) {
								// On indique que la longueur n'est pas bonne
								interaction.reply({
									content:
										"Your message is too long. It should be maximum 2000 characters but your message is actually " +
										sentMessage.length +
										" long.",
									ephemeral: true,
								});
								return;
							}

							// Vérifie que l'input de l'utilisateur pour le week interval est valide, utilise les valeurs de la BDD si le champs n'a pas été spécifié
							let weekIntervalValidated = validateWeekInterval(
								sentWeekInterval ?? weekInterval
							);

							// Si le format pour "weekInterval" n'est pas respecté
							if (weekIntervalValidated.hasOwnProperty("error")) {
								interaction.reply({
									content: weekIntervalValidated.error,
									ephemeral: true,
								});
								return;
							}

							let daysArrayToString = days.join(",");
							// Vérifie que l'input de l'utilisateur pour les jours est valide, utilise les valeurs de la BDD si le champs n'a pas été spécifié
							let daysValidated = validateDays(sentDays ?? daysArrayToString);

							// Si le format pour "days" n'est pas respecté
							if (daysValidated.hasOwnProperty("error")) {
								interaction.reply({
									content: daysValidated.error,
									ephemeral: true,
								});
								return;
							}

							let monthsArrayToString;
							let startDayArrayToString;
							// Vérifie si tous les mois sont sélectionnés
							if (
								months.length === 1 &&
								months[0].month === "ALL" &&
								months[0].startDay === null
							) {
								monthsArrayToString = null;
								startDayArrayToString = null;
							} else {
								// Reconvertis le tableau de la BDD en une chaîne pour la fonction
								monthsArrayToString = months
									.map((item) => item.month)
									.join(",");

								// Si l'utilisateur a spécifié vouloir tous les mois
								if (sentMonths != null) {
									if (sentMonths.toUpperCase() == "ALL") {
										startDayArrayToString = null;
									}
								}
								// Si toutes les valeurs "startDay" sont égales à null ou que "weekInterval" est égale à 1, on met null
								else if (
									months.every((item) => item.startDay === null) ||
									weekIntervalValidated == 1
								) {
									startDayArrayToString = null;
								} else {
									// Reconvertis le tableau de la BDD en une chaîne pour la fonction
									startDayArrayToString = months
										.map((item) => item.startDay)
										.join(",");
								}
							}

							// Vérifie que l'input de l'utilisateur pour les mois et startMonthDay sont valides par rapport à l'intervalle donné, utilise les valeurs de la BDD si le champs n'a pas été spécifié
							let monthsValidated = validateMonths(
								sentMonths ?? monthsArrayToString,
								sentStartMonthDay ?? startDayArrayToString,
								sentWeekInterval ?? weekInterval
							);

							// Si le format pour "months" n'est pas respecté
							if (monthsValidated.hasOwnProperty("error")) {
								interaction.reply({
									content: monthsValidated.error,
									ephemeral: true,
								});
								return;
							}

							// Vérifie que l'input de l'utilisateur pour la time zone est valide, utilise les valeurs de la BDD si le champs n'a pas été spécifié
							let sentTimeZoneValidated = isValidTimeZone(
								sentTimeZone ?? timeZone
							);

							if (sentTimeZoneValidated == false) {
								// On indique que la time zone est invalide
								interaction.reply({
									content:
										"The format of the time zone you sent is wrong, please enter a valid time zone. The format should be like this: **Time zone identifier** (Example: Europe/Paris). Here is the list of time zones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones",
									ephemeral: true,
								});
								return;
							}

							let startTimeString = startTime;
							// Si la valeur du premier mois est différent de "ALL" et que weekInterval est différent de 1, alors il faut mettre startTime à null
							if (
								monthsValidated[0].month.toUpperCase() != "ALL" &&
								((sentWeekInterval != null && sentWeekInterval != 1) ||
									(sentWeekInterval == null && weekInterval != 1))
							) {
								startTimeString = null;
							}

							let daysofWeekToString = daysOfWeek.join(",");
							// Vérifie que l'input de l'utilisateur pour les jours de la semaine est valide
							let daysOfWeekValidated = validateDaysOfWeek(
								sentDaysOfWeek ?? daysofWeekToString,
								sentStartTime ?? startTimeString,
								sentMonths ?? monthsArrayToString,
								sentWeekInterval ?? weekInterval,
								sentTimeZoneValidated
							);

							// Si le format pour "daysOfWeek" n'est pas respecté
							if (daysOfWeekValidated.hasOwnProperty("error")) {
								interaction.reply({
									content: daysOfWeekValidated.error,
									ephemeral: true,
								});
								return;
							}

							// Si l'utilisateur n'a pas rempli l'option "channel", on remet celui de base qu'on retrouve en BDD
							if (sentChannel == null) {
								sentChannel = channelId;
							} else {
								sentChannel = sentChannel.id;
							}
							// Si l'utilisateur n'a pas rempli l'option "time", on remet celui de base qu'on retrouve en BDD
							if (sentTime == null) {
								sentTime = time;
							}

							// Si l'utilisateur n'a pas rempli l'option "message", on remet celui de base qu'on retrouve en BDD
							if (sentMessage == null) {
								sentMessage = message;
							}

							// Si l'utilisateur n'a pas rempli l'option "days", on remet celui de base qu'on retrouve en BDD
							if (sentDays == null) {
								sentDays = days;
							} else {
								sentDays = daysValidated;
							}

							// Si l'utilisateur n'a pas rempli l'option "weekInterval", on remet celui de base qu'on retrouve en BDD
							if (sentWeekInterval == null) {
								sentWeekInterval = weekInterval;
							} else {
								sentWeekInterval = weekIntervalValidated;
							}

							// Si l'utilisateur n'a pas rempli l'option "months" et l'option "startMonthDay", on remet celui de base qu'on retrouve en BDD
							if (sentMonths == null && sentStartMonthDay == null) {
								// Si l'intervalle est égale à 1, on update les mois pour remettre les startingDay de chaque mois à null
								if (sentWeekInterval == 1) {
									sentMonths = monthsValidated;
								} else {
									sentMonths = months;
								}
							} else {
								sentMonths = monthsValidated;
							}

							// Si l'utilisateur n'a pas rempli l'option "daysOfWeek", on remet celui de base qu'on retrouve en BDD
							if (sentDaysOfWeek == null) {
								sentDaysOfWeek = daysOfWeek;
							} else {
								sentDaysOfWeek = daysOfWeekValidated.daysArray;
							}

							// Si l'utilisateur n'a pas rempli l'option "timeZone", on remet celui de base qu'on retrouve en BDD
							if (sentTimeZone == null) {
								sentTimeZone = timeZone;
							} else {
								sentTimeZone = sentTimeZoneValidated;
							}

							// Si l'utilisateur n'a pas rempli l'option "startTime", on remet celui de base qu'on retrouve en BDD
							if (sentStartTime == null) {
								// Si la valeur du premier mois est différent de "ALL" et que weekInterval est différent de 1, alors on met le startTime à null, sinon on le remet
								if (
									sentMonths[0].month.toUpperCase() != "ALL" &&
									sentWeekInterval != 1
								) {
									sentStartTime = null;
								} else {
									if (startTime == null) {
										sentStartTime =
											getCurrentDatetimeWithTimeZone(sentTimeZone);
									} else {
										sentStartTime = startTime;
									}
								}
							} else {
								// Si la valeur du premier mois est différent de "ALL" et que weekInterval est différent de 1, alors on met le startTime à null, sinon on le remet
								if (
									sentMonths[0].month.toUpperCase() != "ALL" &&
									sentWeekInterval != 1
								) {
									sentStartTime = null;
								} else {
									sentStartTime = daysOfWeekValidated.startTime;
								}
							}

							// On modifie le CRON de la BDD avec les valeurs saisies par l'utilisateur
							const updateResults = await Guild.updateOne(
								{ _id: interaction.guildId, "crons._id": _id },
								{
									$set: {
										"crons.$.time": sentTime,
										"crons.$.days": sentDays,
										"crons.$.months": sentMonths,
										"crons.$.daysOfWeek": sentDaysOfWeek,
										"crons.$.message": sentMessage,
										"crons.$.channelId": sentChannel,
										"crons.$.weekInterval": sentWeekInterval,
										"crons.$.startTime": sentStartTime,
										"crons.$.timeZone": sentTimeZone,
									},
								}
							);

							const cronJobId =
								interaction.guildId + "_" + ObjectId(sentId).toString();

							// Si le CRON existe, on le stop et supprime
							if (CronJobManager.cronJobManager.exists(cronJobId)) {
								CronJobManager.cronJobManager.stop(cronJobId);
								CronJobManager.cronJobManager.deleteJob(cronJobId);
							}

							// Récupérer les minutes et heures
							let hours = sentTime.split(":")[0];
							let minutes = sentTime.split(":")[1];

							// Convertis les jours pour les trier
							let daysConverted = convertDays(sentDays);

							// Convertis les mois en leurs nombres correspondants pour le cronjob
							let monthsData = convertMonthsToNumbers(sentMonths);

							// Convertis les jours de la semaine en leurs nombres correspondants pour le cronjob
							let daysOfWeekToNumbers =
								convertDaysOfWeekToNumbers(sentDaysOfWeek);

							// On crée un nouveau CRON avec les nouvelles informations sur le manager
							CronJobManager.cronJobManager.add(
								cronJobId,
								`1 ${minutes} ${hours} ${daysConverted} ${monthsData.monthsToNumbers} ${daysOfWeekToNumbers}`,
								function () {
									// On récupère le datetime actuel en utilisant la timezone spécifiée
									let currentDatetime =
										getCurrentDatetimeWithTimeZone(sentTimeZone);

									// Variable pour vérifier si le message a été envoyé
									let isMessageSent = false;

									// Si l'intervalle hebdomadaire est égal à 1, il n'y a pas de vérification à faire hormis par rapport au startTime
									if (sentWeekInterval == 1) {
										if (sentStartTime != null) {
											// Transforme les chaînes de caractères en dates
											let initialDate = new Date(sentStartTime);
											let actualDate = new Date(currentDatetime);
											// Vérifie que la date d'aujourd'hui est supérieure ou égale à la date de début
											if (actualDate >= initialDate) {
												guild.channels.cache.get(sentChannel).send(sentMessage);
											}
										} else {
											guild.channels.cache.get(sentChannel).send(sentMessage);
										}
									}
									// Si l'intervalle hebdomadaire est supérieur à 1, des vérifications doivent être effectuées pour s'assurer que les messages sont envoyés lors des bonnes semaines
									else {
										// Vérifie si le jour actuel correspond à un jour spécifié (afin de différencier avec "daysOfWeek"), auquel cas on envoie le message dans tous les cas
										if (daysConverted != "*") {
											if (
												isCurrentDayOfMonth(
													daysConverted,
													sentStartTime,
													sentTimeZone
												) == true
											) {
												guild.channels.cache.get(sentChannel).send(sentMessage);
												isMessageSent = true;
											}
										}
										// Vérifie si la semaine du mois actuel correspond aux paramètres saisis par l'utilisateur
										if (monthsData.monthsToNumbers != "*") {
											if (
												checkIfGoodMonthAndWeekForMessage(
													monthsData,
													daysOfWeekToNumbers,
													sentWeekInterval,
													sentStartTime,
													sentTimeZone
												) == true
											) {
												// Vérification si le message n'a pas déjà été envoyé pour ne pas le mettre en double
												if (isMessageSent == false) {
													guild.channels.cache
														.get(sentChannel)
														.send(sentMessage);
												}
											}
										} else {
											// On vérifie s'il est possible d'envoyer le message sur la semaine actuelle par rapport au startTime
											let shouldMessageBeSent = checkWeekInterval(
												sentStartTime,
												currentDatetime,
												sentWeekInterval
											);

											// On envoie le message si la semaine est la bonne
											if (shouldMessageBeSent == true) {
												// Vérification si le message n'a pas déjà été envoyé pour ne pas le mettre en double
												if (isMessageSent == false) {
													guild.channels.cache
														.get(sentChannel)
														.send(sentMessage);
												}
											}
										}
									}
								},
								{
									start: true,
									timeZone: sentTimeZone,
								}
							);

							// Si on a effectivement modifié quelque chose de la BDD, on précise que le CRON a bien été modifié
							if (updateResults.modifiedCount != 0) {
								interaction.reply({
									content: "The CRON has been successfully updated.",
									ephemeral: true,
								});
							}
							// Sinon, on indique qu'aucun changement n'a été relevé
							else {
								interaction.reply({
									content: "No changes were noted for the CRON.",
									ephemeral: true,
								});
							}
						}
					}
				}
				// Si on ne récupère pas de données, cela veut dire que l'ID n'était pas bon et on l'indique à l'utilisateur
				else {
					interaction.reply({
						content: "No CRON found for this Id.",
						ephemeral: true,
					});
				}
			}
		}
		// Si le format de l'ID n'est pas respecté, on l'indique à l'utilisateur
		else {
			interaction.reply({
				content: "No CRON found for this Id.",
				ephemeral: true,
			});
		}
	},
};
