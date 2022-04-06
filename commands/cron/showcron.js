const { Guild } = require("../../models/index");
const { MessageEmbed } = require("discord.js");
const DiscordJS = require("discord.js");
const checkIfGuildExists = require("../../utils/checkIfGuildExists");

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
						const { time, message, channelId, isActive, _id } = cronData;

						let channel = guild.channels.cache.get(channelId);

						// Si l'Id du channel n'existe plus sur le serveur, on l'indique à l'utilisateur
						if (!channel) {
							channel =
								"This channel no longer exists, please update the channel of this CRON.";
						}

						// Contenu du embed
						const embedReply = new MessageEmbed()
							.setColor("#0096FF")
							.setDescription("The informations of your CRON:")
							.addField("Id", `${_id}`)
							.addField("Message", `${message}`)
							.addField("Channel", `${channel}`)
							.addField("Time", `${time}`);

						// Affichage du embed à l'utilisateur
						interaction.reply({ embeds: [embedReply], ephemeral: true });
					}
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
