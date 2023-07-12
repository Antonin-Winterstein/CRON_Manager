const { Guild } = require("../../models/index");
const { MessageEmbed } = require("discord.js");
const DiscordJS = require("discord.js");
const checkIfGuildExists = require("../../utils/checkIfGuildExists");
const { pagination } = require("../../utils/tools");

module.exports = {
	name: "showcron",
	category: "cron",
	description: "Shows the selected CRON with its data using its identifier.",
	permissions: ["ADMINISTRATOR"],
	usage: "showcron [identifier]",
	examples: ["showcron [622ea01f78ef802465cda7d4]"],
	options: [
		{
			name: "id",
			description: "The Id of the CRON.",
			required: true,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
	],
	async runInteraction(Client, interaction) {
		// Récupération des données envoyées par l'utilisateur
		const sentId = interaction.options.getString("id");

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

				// Tableau contenant tous les embeds
				const pages = [];

				// On récupère les données pour l'Id du CRON envoyé par l'utilisateur sur son serveur
				const findOneResults = await Guild.findOne(
					{ _id: interaction.guildId },
					{ crons: { $elemMatch: { _id: sentId } } }
				);
				const cron = findOneResults.crons;

				// Si on récupère le CRON
				if (typeof cron !== "undefined" && cron.length > 0) {
					// Variable pour afficher la page actuelle
					let currentPage = 0;
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

				// Si on ne récupère pas le CRON
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
