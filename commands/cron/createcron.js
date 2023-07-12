const { Guild } = require("../../models/index");
const { MessageEmbed } = require("discord.js");
const DiscordJS = require("discord.js");
const checkIfGuildExists = require("../../utils/checkIfGuildExists");
const {
	validateWeekInterval,
	validateDays,
	validateMonths,
	validateDaysOfWeek,
	isValidTimeZone,
	pagination,
} = require("../../utils/tools");

module.exports = {
	name: "createcron",
	category: "cron",
	description:
		"Creates a CRON that sends a message to a specific hour in a specific channel with custom parameters.",
	permissions: ["ADMINISTRATOR"],
	usage:
		"createcron [channel] [time] [message] <days> <months> <daysOfWeek> <weekInterval> <startTime> <startMonthDay> <timeZone>",
	examples: [
		"createcron [yourchannel] [09:21] [Hello World!] <1, 10, 21> <January, September> <Monday, Wednesday> <2> <1, 2> <Europe/Paris>",
		"createcron [yourchannel] [09:21] [Hello World!] <ALL> <ALL> <ALL> <2> <2023-09-20>",
		"createcron [yourchannel] [09:21] [Hello World!] <Europe/Paris>",
		"createcron [yourchannel] [09:21] [Hello World!]",
	],
	options: [
		{
			name: "channel",
			description: "The channel in which the message will be sent.",
			required: true,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.CHANNEL,
			channel_types: [DiscordJS.Constants.ChannelTypes.GUILD_TEXT],
		},
		{
			name: "time",
			description: "The time when the message will be sent. (format: HH:mm)",
			required: true,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "message",
			description: "The message you want to send.",
			required: true,
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
		const sentChannel = interaction.options.getChannel("channel");
		const sentTime = interaction.options.getString("time");
		const sentMessage = interaction.options.getString("message");
		const sentDays = interaction.options.getString("days");
		const sentMonths = interaction.options.getString("months");
		const sentDaysOfWeek = interaction.options.getString("daysofweek");
		const sentWeekInterval = interaction.options.getInteger("weekinterval");
		const sentStartTime = interaction.options.getString("starttime");
		const sentStartMonthDay = interaction.options.getString("startmonthday");
		const sentTimeZone = interaction.options.getString("timezone");

		// Regex qui permet de respecter le format HH:MM
		let timeRegex = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$";

		// Vérifie que l'input de l'utilisateur pour le week interval est valide
		let weekInterval = validateWeekInterval(sentWeekInterval);

		// Vérifie que l'input de l'utilisateur pour les jours est valide
		let days = validateDays(sentDays);

		// Vérifie que l'input de l'utilisateur pour les mois et startMonthDay sont valides par rapport à l'intervalle donné
		let months = validateMonths(sentMonths, sentStartMonthDay, weekInterval);

		// Vérifie que l'input de l'utilisateur pour la time zone est valide
		let timeZone = isValidTimeZone(sentTimeZone);

		// Vérifie que l'input de l'utilisateur pour les jours de la semaine est valide
		let daysOfWeek = validateDaysOfWeek(
			sentDaysOfWeek,
			sentStartTime,
			sentMonths,
			weekInterval,
			timeZone
		);

		// Si tous les formats sont respectés
		if (
			sentMessage.length <= 2000 &&
			sentTime.match(timeRegex) != null &&
			!weekInterval.hasOwnProperty("error") &&
			!days.hasOwnProperty("error") &&
			!months.hasOwnProperty("error") &&
			!daysOfWeek.hasOwnProperty("error") &&
			timeZone != false
		) {
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

				// Créer le CRON
				const addCron = await Guild.updateOne(
					{
						_id: interaction.guildId,
					},
					{
						$push: {
							crons: {
								time: sentTime,
								days: days,
								months: months,
								daysOfWeek: daysOfWeek.daysArray,
								message: sentMessage,
								channelId: sentChannel.id,
								weekInterval: weekInterval,
								startTime: daysOfWeek.startTime,
								timeZone: timeZone,
								isActive: false,
							},
						},
					}
				);

				// Si on a effectivement ajouté le CRON à la BDD, on précise que le CRON a bien été ajouté
				if (addCron.modifiedCount != 0) {
					// Tableau contenant tous les embeds
					const pages = [];
					// Variable pour afficher la page actuelle
					let currentPage = 0;
					// Format des mois comme-ci: Mois (startMonthDay)...
					let formattedMonths = months.map(function (item) {
						let startDayString;
						// Si startDay est à null, on explique à l'user
						if (item.startDay == null) {
							startDayString = "None";
						} else {
							startDayString = item.startDay;
						}
						return item.month + " (Start month day: " + startDayString + ")";
					});
					formattedMonths = formattedMonths.join(",");

					// Si startTime est à null, on explique à l'user
					let startTimeString;
					if (daysOfWeek.startTime == null) {
						startTimeString =
							"Can't be used if months are specified with a weekInterval of more than 1. Using startMonthDay instead.";
					} else {
						startTimeString = daysOfWeek.startTime;
					}

					// Longueur de tous les éléments
					let dataLength =
						sentChannel.toString().length +
						sentTime.toString().length +
						days.toString().length +
						formattedMonths.toString().length +
						daysOfWeek.daysArray.toString().length +
						weekInterval.toString().length +
						startTimeString.toString().length +
						timeZone.toString().length +
						sentMessage.toString().length;

					let embedReply;
					if (dataLength > 1024) {
						currentPage++;

						// Calcule les caractères restants disponibles
						let remainingCharacters = 1024 - (dataLength - sentMessage.length);

						// Trouve le dernier mot complet parmi les caractères restants
						let lastSpaceIndex = sentMessage.lastIndexOf(
							" ",
							remainingCharacters
						);
						if (lastSpaceIndex === -1) {
							// Aucun espace trouvé dans les caractères restants, on split donc à l'index des caractères restants
							lastSpaceIndex = remainingCharacters;
						}

						// Divise le message au dernier mot complet
						let splittedMessage = sentMessage.slice(0, lastSpaceIndex);
						let remainingWords = sentMessage.slice(lastSpaceIndex);

						// Met à jour le message restant pour inclure les mots restants
						let remainingMessage = remainingWords.trim();

						// Contenu du embed
						embedReply = new MessageEmbed()
							.setColor("#0096FF")
							.setTitle(`New CRON - Page ${currentPage}`)
							.setDescription("The information of your new CRON:")
							.addField("Channel", `${sentChannel}`)
							.addField("Time", `${sentTime}`)
							.addField("Days", `${days}`)
							.addField("Months", `${formattedMonths}`)
							.addField("Days of week", `${daysOfWeek.daysArray}`)
							.addField("Week interval", `${weekInterval}`)
							.addField("Start time (YYYY-MM-DD)", `${startTimeString}`)
							.addField("Time zone", `${timeZone}`)
							.addField("Message", `${splittedMessage}`)
							.setFooter({
								text: `Added by: ${interaction.member.user.tag}`,
								iconURL: `${interaction.member.user.displayAvatarURL()}`,
							});

						// Push du embed dans le tableau d'embed
						pages.push(embedReply);
						while (remainingMessage.length > 1024) {
							currentPage++;

							// Calcule les caractères restants disponibles
							remainingCharacters = 1024;

							// Trouve le dernier mot complet parmi les caractères restants
							lastSpaceIndex = remainingMessage.lastIndexOf(
								" ",
								remainingCharacters
							);
							if (lastSpaceIndex === -1) {
								// Aucun espace trouvé dans les caractères restants, on split donc à l'index des caractères restants
								lastSpaceIndex = remainingCharacters;
							}

							// Divise le message au dernier mot complet
							splittedMessage = remainingMessage.slice(0, lastSpaceIndex);
							remainingWords = remainingMessage.slice(lastSpaceIndex);

							// Met à jour le message restant pour inclure les mots restants
							remainingMessage = remainingWords.trim();

							// Contenu du embed
							embedReply = new MessageEmbed()
								.setColor("#0096FF")
								.setTitle(`New CRON - Page ${currentPage}`)
								.addField("Message (following)", `${splittedMessage}`);

							// Push the embed into the array of embeds
							pages.push(embedReply);
						}
						// Si le message fait moins de 1024 caractères, cela veut dire que c'est le dernier embed à afficher
						if (remainingMessage.length <= 1024) {
							currentPage++;
							// Contenu du embed
							embedReply = new MessageEmbed()
								.setColor("#0096FF")
								.setTitle(`New CRON - Page ${currentPage}`)
								.addField("Message (following)", `${remainingMessage}`);

							// Push du embed dans le tableau d'embed
							pages.push(embedReply);
						}
					} else {
						currentPage++;
						// Contenu du embed
						embedReply = new MessageEmbed()
							.setColor("#0096FF")
							.setTitle(`New CRON - Page ${currentPage}`)
							.setDescription("The information of your new CRON:")
							.addField("Channel", `${sentChannel}`)
							.addField("Time", `${sentTime}`)
							.addField("Days", `${days}`)
							.addField("Months", `${formattedMonths}`)
							.addField("Days of week", `${daysOfWeek.daysArray}`)
							.addField("Week interval", `${weekInterval}`)
							.addField("Start time (YYYY-MM-DD)", `${startTimeString}`)
							.addField("Time zone", `${timeZone}`)
							.addField("Message", `${sentMessage}`)
							.setFooter({
								text: `Added by: ${interaction.member.user.tag}`,
								iconURL: `${interaction.member.user.displayAvatarURL()}`,
							});

						// Push du embed dans le tableau d'embed
						pages.push(embedReply);
					}
					pagination(interaction, pages);
				}
				// Sinon, on indique qu'il y a eu un problème lors de la création du CRON
				else {
					interaction.reply({
						content: "Error happened while trying to add the CRON.",
						ephemeral: true,
					});
				}
			}
		}
		// Si les formats pour "message", "time", "days", "months", "daysOfWeek" et "timezone" ne sont pas respectés
		else {
			if (sentTime.match(timeRegex) == null) {
				// On indique que le format pour "time" n'est pas bon
				interaction.reply({
					content:
						"The format of the time you sent is wrong, it should be like this: **HH:mm** (Example: 09:21)",
					ephemeral: true,
				});
				return;
			}

			if (sentMessage.length > 2000) {
				// On indique que l'utilisateur a dépassé la limite de caractères disponibles
				interaction.reply({
					content:
						"Your message is too long. It should be maximum 2000 characters but your message is actually " +
						sentMessage.length +
						" long.",
					ephemeral: true,
				});
				return;
			}

			// Si le format pour "weekInterval" n'est pas respecté
			if (weekInterval.hasOwnProperty("error")) {
				interaction.reply({
					content: weekInterval.error,
					ephemeral: true,
				});
				return;
			}

			// Si le format pour "days" n'est pas respecté
			if (days.hasOwnProperty("error")) {
				interaction.reply({
					content: days.error,
					ephemeral: true,
				});
				return;
			}

			// Si le format pour "months" n'est pas respecté
			if (months.hasOwnProperty("error")) {
				interaction.reply({
					content: months.error,
					ephemeral: true,
				});
				return;
			}

			// Si le format pour "daysOfWeek" n'est pas respecté
			if (daysOfWeek.hasOwnProperty("error")) {
				interaction.reply({
					content: daysOfWeek.error,
					ephemeral: true,
				});
				return;
			}

			// Si la time zone est invalide, on l'indique à l'utilisateur
			if (timeZone == false) {
				// On indique que la time zone est invalide
				interaction.reply({
					content:
						"The format of the time zone you sent is wrong, please enter a valid time zone. The format should be like this: **Time zone identifier** (Example: Europe/Paris). Here is the list of time zones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones",
					ephemeral: true,
				});
				return;
			}
		}
	},
};
