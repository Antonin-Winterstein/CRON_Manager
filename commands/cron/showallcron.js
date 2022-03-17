const { Guild } = require("../../models/index");

module.exports = {
	name: "showallcron",
	category: "cron",
	description: "Shows all the CRON activated on the server with their data.",
	userPermissions: ["ADMINISTRATOR"],
	usage: "showallcron",
	examples: ["showallcron"],
	async runInteraction(Client, interaction) {
		// On récupère les données des CRON du serveur en question
		const findResults = await Guild.find({
			_id: interaction.guildId,
		});
		let replyContent;

		const guild = await Client.guilds.fetch(interaction.guildId);

		// On boucle sur tous les CRON récupérés
		for (const post of findResults) {
			const crons = post.crons;

			// Si on récupère des CRON
			if (typeof crons !== "undefined" && crons.length > 0) {
				// Boucler sur tous les CRON du serveur
				for (const cronData of crons) {
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
					// S'il n'y a pas d'erreur, on affiche les données des CRON
					else {
						// Condition nécessaire pour la première itération de la boucle
						if (replyContent == undefined) {
							// On affiche les données du CRON
							replyContent = `__**Id:**__ ${_id}\n__**Channel:**__ ${channel}\n__**Time:**__ ${time}\n__**Message:**__ ${message}\n\n`;
						} else {
							// On concatène les données des CRON précédents au nouveau
							replyContent =
								replyContent +
								`__**Id:**__ ${_id}\n__**Channel:**__ ${channel}\n__**Time:**__ ${time}\n__**Message:**__ ${message}\n\n`;
						}
					}
				}
				// On montre à l'utilisateur tous les CRON sur son serveur
				interaction.reply({
					content: replyContent,
					ephemeral: true,
				});
			}
			// Si on ne trouve pas de CRON, on indique à l'utilisateur qu'il n'en existe pas sur le serveur
			else {
				interaction.reply({
					content: "No CRON found on this server. Please try to create one.",
					ephemeral: true,
				});
			}
		}
	},
};
