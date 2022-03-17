const { Guild } = require("../../models/index");
const DiscordJS = require("discord.js");

module.exports = {
	name: "showcron",
	category: "cron",
	description: "Shows the selected CRON with its data using its identifier.",
	userPermissions: ["ADMINISTRATOR"],
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
			// On récupère les données pour l'ID envoyé par l'utilisateur sur son serveur
			const findOneResults = await Guild.findOne(
				{ _id: interaction.guildId },
				{ crons: { $elemMatch: { _id: sentId } } }
			);

			const guild = await Client.guilds.fetch(interaction.guildId);
			const cron = findOneResults.crons;

			// Si on récupère des données
			if (typeof cron !== "undefined" && cron.length > 0) {
				for (const cronData of cron) {
					const { time, message, channelId, isActive, _id } = cronData;

					const channel = guild.channels.cache.get(channelId);
					if (!channel) {
						continue;
					}

					// Si on arrive pas à récupérer l'Id du serveur ou du channel, on affiche une erreur à l'utilisateur
					if (!guild || !channel) {
						interaction.reply({
							content: "An error occured. Please contact the creator.",
							ephemeral: true,
						});
					}
					// S'il n'y a pas d'erreur, on affiche les données du CRON
					else {
						interaction.reply({
							content: `__**Id:**__ ${_id}\n__**Channel:**__ ${channel}\n__**Time:**__ ${time}\n__**Message:**__ ${message}\n\n`,
							ephemeral: true,
						});
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
		// Si le format de l'ID n'est pas respecté, on l'indique à l'utilisateur
		else {
			interaction.reply({
				content: "No CRON found for this Id.",
				ephemeral: true,
			});
		}
	},
};
