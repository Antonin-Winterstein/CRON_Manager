const { Guild } = require("../../models/index");
const DiscordJS = require("discord.js");
const ObjectId = require("mongodb").ObjectId;
const CronJobManager = require("../../utils/cronJobManager");
const checkIfGuildExists = require("../../utils/checkIfGuildExists");

module.exports = {
	name: "deleteallcron",
	category: "cron",
	description: "Deletes all CRON of the server.",
	permissions: ["ADMINISTRATOR"],
	usage: "deleteallcron",
	examples: ["deleteallcron"],
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

			let deletedCrons = 0;

			// On boucle sur tous les CRON récupérés sur le serveur
			for (const post of findResults) {
				const crons = post.crons;

				// Si on récupère des CRON
				if (typeof crons !== "undefined" && crons.length > 0) {
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

						// On supprime le CRON pour l'ID actuel sur son serveur
						let updateOneResults = await Guild.updateOne(
							{
								_id: interaction.guildId,
							},
							{ $pull: { crons: { _id: _id } } }
						);

						// Si on a effectivement supprimé quelque chose de la BDD
						if (updateOneResults.modifiedCount != 0) {
							deletedCrons++;
							const cronJobId =
								interaction.guildId + "_" + ObjectId(_id).toString();

							// Si le CRON existe
							if (CronJobManager.cronJobManager.exists(cronJobId)) {
								// On stop le CRON du manager
								CronJobManager.cronJobManager.stop(cronJobId);
								// On supprime le CRON du manager
								CronJobManager.cronJobManager.deleteJob(cronJobId);
							}
						}
					}
					// Si on a bien supprimé les CRONs, on l'indique à l'utilisateur
					if (deletedCrons > 0) {
						interaction.reply({
							content:
								"Your server's CRONs (" +
								deletedCrons +
								" found) have been successfully deleted.",
							ephemeral: true,
						});
					}
				}
				// Si on ne trouve pas de CRON, on indique à l'utilisateur qu'il n'en existe pas sur le serveur
				else {
					interaction.reply({
						content: "No CRON found on this server. Nothing to delete.",
						ephemeral: true,
					});
					return;
				}
			}
		}
	},
};
