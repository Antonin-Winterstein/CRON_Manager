const { Guild } = require("../../models/index");
const { MessageEmbed } = require("discord.js");
const checkIfGuildExists = require("../../utils/checkIfGuildExists");

module.exports = {
	name: "showallcron",
	category: "cron",
	description: "Shows all the CRON activated on the server with their data.",
	userPermissions: ["ADMINISTRATOR"],
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
			let replyContent;

			await checkIfGuildExists.checkIfGuildExists(
				findResults,
				interaction,
				"No CRON found on this server. Please try to create one."
			);

			// On boucle sur tous les CRON récupérés sur le serveur
			for (const post of findResults) {
				const crons = post.crons;

				const embedReply = new MessageEmbed()
					.setColor("#0096FF")
					.setDescription("The informations of all of your CRON:");
				// Si on récupère des CRON
				if (typeof crons !== "undefined" && crons.length > 0) {
					// Boucler sur tous les CRON du serveur
					let increment = 0;
					for (const cronData of crons) {
						const { time, message, channelId, isActive, _id } = cronData;

						let channel = guild.channels.cache.get(channelId);

						// Si l'Id du channel n'existe plus sur le serveur, on l'indique à l'utilisateur
						if (!channel) {
							channel =
								"This channel no longer exists, please update the channel of this CRON.";
						}

						increment++;

						// console.log(crons.length);

						embedReply.addField("Id", `${_id}`);
						embedReply.addField("Message", `${message}`);
						embedReply.addField("Channel", `${channel}`);
						embedReply.addField("Time", `${time}`);
						if (increment != crons.length) {
							embedReply.addField("______", "\u200B");
						}
					}
					// On montre à l'utilisateur tous les CRON sur son serveur
					interaction.reply({ embeds: [embedReply], ephemeral: true });
				}
				// Si on ne trouve pas de CRON, on indique à l'utilisateur qu'il n'en existe pas sur le serveur
				else {
					interaction.reply({
						content: "No CRON found on this server. Please try to create one.",
						ephemeral: true,
					});
				}
			}
		}
	},
};
