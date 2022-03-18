const { Guild } = require("../models/index");
const CronJobManager = require("cron-job-manager");
const ObjectId = require("mongodb").ObjectId;

// Création du manager des CRON
let cronJobManager = new CronJobManager();

// Fonction qui vérifie si un nouveau CRON a été créé pour l'activer
const checkForCRON = async (Client) => {
	// Récupérer tous les serveurs de la base de données
	const findResults = await Guild.find();

	// Boucler sur tous les serveurs récupérés
	for (const post of findResults) {
		const guildId = post._id;
		const crons = post.crons;

		const guild = await Client.guilds.fetch(guildId);
		if (!guild) {
			continue;
		}

		// Boucler sur tous les CRON du serveur
		for (const cronData of crons) {
			const { time, message, channelId, isActive, _id } = cronData;
			const channel = guild.channels.cache.get(channelId);

			// Si le channel n'existe pas, on continue la boucle
			if (!channel) {
				continue;
			}

			// Récupérer les minutes et heures
			let hours = time.split(":")[0];
			let minutes = time.split(":")[1];

			// Si le CRON n'est pas actif, on l'active
			if (isActive == false) {
				cronJobManager.add(
					`${guildId}_${ObjectId(_id).toString()}`,
					`1 ${minutes} ${hours} * * *`,
					function () {
						channel.send(message);
					},
					{
						start: true,
						timeZone: "Europe/Paris",
					}
				);

				// On actualise le statut du CRON en actif
				await Guild.updateOne(
					{ _id: guildId, "crons._id": _id },
					{ $set: { "crons.$.isActive": true } }
				);
			}
		}
	}
	// Toutes les 10 secondes, on rappelle cette même fonction pour vérifier si de nouveaux CRON ont été créé pour ainsi les activer
	setTimeout(checkForCRON, 1000 * 10, Client);
};

module.exports = { cronJobManager, checkForCRON };
