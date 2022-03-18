const { Guild } = require("../../models/index");
const ObjectId = require("mongodb").ObjectId;
const CronJobManager = require("../../utils/cronJobManager");

module.exports = {
	name: "channelDelete",
	once: false,
	async execute(Client, channel) {
		// On récupère les données des CRON du serveur qui a supprimé le channel en question
		const findResults = await Guild.aggregate([
			{
				$match: {
					_id: channel.guildId,
					"crons.channelId": channel.id,
				},
			},
			{
				$addFields: {
					crons: {
						$filter: {
							input: "$crons",
							cond: {
								$eq: ["$$this.channelId", channel.id],
							},
						},
					},
				},
			},
		]);

		// Si on récupère au moins un CRON
		if (typeof findResults !== "undefined" && findResults.length > 0) {
			// On boucle sur tous les CRON récupérés
			for (const post of findResults) {
				const crons = post.crons;

				// Boucler sur tous les CRON du serveur
				for (const cronData of crons) {
					const { time, message, channelId, isActive, _id } = cronData;

					const cronJobId = channel.guildId + "_" + ObjectId(_id).toString();

					// Si le CRON existe
					if (CronJobManager.cronJobManager.exists(cronJobId)) {
						// On supprime le CRON du manager
						CronJobManager.cronJobManager.deleteJob(cronJobId);

						// On met le statut isActive du CRON à "false"
						await Guild.updateOne(
							{ _id: channel.guildId, "crons._id": _id },
							{
								$set: {
									"crons.$.isActive": false,
								},
							}
						);
					}
				}
			}
		}
	},
};
