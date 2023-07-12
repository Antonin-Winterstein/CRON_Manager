const { Guild } = require("../../models/index");
const { MessageEmbed } = require("discord.js");
const checkIfGuildExists = require("../../utils/checkIfGuildExists");
const { pagination } = require("../../utils/tools");

module.exports = {
	name: "showallcron",
	category: "cron",
	description: "Shows all the CRON activated on the server with their data.",
	permissions: ["ADMINISTRATOR"],
	usage: "showallcron",
	examples: ["showallcron"],
	async runInteraction(Client, interaction) {
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

			// Tableau contenant tous les embeds
			const pages = [];

			// On boucle sur tous les CRON récupérés sur le serveur
			for (const post of findResults) {
				const crons = post.crons;

				// Si on récupère des CRON
				if (typeof crons !== "undefined" && crons.length > 0) {
					// Variable pour afficher la page actuelle
					let currentPage = 0;
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

						let channel = guild.channels.cache.get(channelId);

						// Si l'Id du channel n'existe plus sur le serveur, on l'indique à l'utilisateur
						if (!channel) {
							channel =
								"This channel no longer exists, please update the channel of this CRON.";
						}

						// Format des mois comme-ci: Mois (startDay)...
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
						if (startTime == null) {
							startTimeString =
								"Can't be used if months are specified with a weekInterval of more than 1. Using startMonthDay instead.";
						} else {
							startTimeString = startTime;
						}

						// Longueur de tous les éléments
						let dataLength =
							_id.toString().length +
							channel.toString().length +
							time.toString().length +
							days.toString().length +
							formattedMonths.toString().length +
							daysOfWeek.toString().length +
							weekInterval.toString().length +
							startTimeString.toString().length +
							timeZone.toString().length +
							message.toString().length;

						let embedReply;
						if (dataLength > 1024) {
							currentPage++;

							// Calcule les caractères restants disponibles
							let remainingCharacters = 1024 - (dataLength - message.length);

							// Trouve le dernier mot complet parmi les caractères restants
							let lastSpaceIndex = message.lastIndexOf(
								" ",
								remainingCharacters
							);
							if (lastSpaceIndex === -1) {
								// Aucun espace trouvé dans les caractères restants, on split donc à l'index des caractères restants
								lastSpaceIndex = remainingCharacters;
							}

							// Divise le message au dernier mot complet
							let splittedMessage = message.slice(0, lastSpaceIndex);
							let remainingWords = message.slice(lastSpaceIndex);

							// Met à jour le message restant pour inclure les mots restants
							let remainingMessage = remainingWords.trim();

							// Contenu du embed
							embedReply = new MessageEmbed()
								.setColor("#0096FF")
								.setTitle(`CRONs - Page ${currentPage}`)
								.setDescription("The information of your CRON:")
								.addField("Id", `${_id}`)
								.addField("Channel", `${channel}`)
								.addField("Time", `${time}`)
								.addField("Days", `${days}`)
								.addField("Months", `${formattedMonths}`)
								.addField("Days of week", `${daysOfWeek}`)
								.addField("Week interval", `${weekInterval}`)
								.addField("Start time (YYYY-MM-DD)", `${startTimeString}`)
								.addField("Time zone", `${timeZone}`)
								.addField("Message", `${splittedMessage}`);

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
									.setTitle(`CRONs - Page ${currentPage}`)
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
									.setTitle(`CRONs - Page ${currentPage}`)
									.addField("Message (following)", `${remainingMessage}`);

								// Push du embed dans le tableau d'embed
								pages.push(embedReply);
							}
						} else {
							currentPage++;
							// Contenu du embed
							embedReply = new MessageEmbed()
								.setColor("#0096FF")
								.setTitle(`CRONs - Page ${currentPage}`)
								.setDescription("The information of your CRON:")
								.addField("Id", `${_id}`)
								.addField("Channel", `${channel}`)
								.addField("Time", `${time}`)
								.addField("Days", `${days}`)
								.addField("Months", `${formattedMonths}`)
								.addField("Days of week", `${daysOfWeek}`)
								.addField("Week interval", `${weekInterval}`)
								.addField("Start time (YYYY-MM-DD)", `${startTimeString}`)
								.addField("Time zone", `${timeZone}`)
								.addField("Message", `${message}`);

							// Push du embed dans le tableau d'embed
							pages.push(embedReply);
						}
					}
					pagination(interaction, pages);
				}
				// Si on ne trouve pas de CRON, on indique à l'utilisateur qu'il n'en existe pas sur le serveur
				else {
					interaction.reply({
						content: "No CRON found on this server. Please try to create one.",
						ephemeral: true,
					});
					return;
				}
			}
		}
	},
};
