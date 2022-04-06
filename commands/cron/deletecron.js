const { Guild } = require("../../models/index");
const DiscordJS = require("discord.js");
const ObjectId = require("mongodb").ObjectId;
const CronJobManager = require("../../utils/cronJobManager");
const checkIfGuildExists = require("../../utils/checkIfGuildExists");

module.exports = {
	name: "deletecron",
	category: "cron",
	description: "Deletes the CRON using its identifier.",
	permissions: ["ADMINISTRATOR"],
	usage: "deletecron [identifier]",
	examples: ["deletecron [622ea01f78ef802465cda7d4]"],
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

				// On supprime le CRON pour l'ID envoyé par l'utilisateur sur son serveur
				let updateOneResults = await Guild.updateOne(
					{
						_id: interaction.guildId,
					},
					{ $pull: { crons: { _id: sentId } } }
				);

				// Si on a effectivement supprimé quelque chose de la BDD, on précise que le CRON a bien été supprimé
				if (updateOneResults.modifiedCount != 0) {
					const cronJobId =
						interaction.guildId + "_" + ObjectId(sentId).toString();

					// Si le CRON existe
					if (CronJobManager.cronJobManager.exists(cronJobId)) {
						// On supprime le CRON du manager
						CronJobManager.cronJobManager.deleteJob(cronJobId);
					}

					interaction.reply({
						content: "The CRON has been successfully deleted.",
						ephemeral: true,
					});
				}
				// Si rien n'a été supprimé, cela veut dire que l'ID n'était pas bon et on l'indique à l'utilisateur
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
