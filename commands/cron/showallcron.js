const cronSchema = require("../../models/cronSchema");

module.exports = {
	name: "showallcron",
	category: "cron",
	description: "Shows all the CRON activated on the server with their data.",
	userPermissions: ["ADMINISTRATOR"],
	usage: "showallcron",
	examples: ["showallcron"],
	async runInteraction(Client, interaction) {
		// On récupère les données des CRON du serveur en question
		const findResults = await cronSchema.find({
			guildId: interaction.guildId,
		});
		let replyContent;

		// Si on récupère des CRON
		if (typeof findResults !== "undefined" && findResults.length > 0) {
			// On boucle sur tous les CRON récupérés
			for (const post of findResults) {
				const { _id, time, message, guildId, channelId, isActive } = post;

				const guild = await Client.guilds.fetch(guildId);
				if (!guild) {
					continue;
				}

				const channel = guild.channels.cache.get(channelId);
				if (!channel) {
					continue;
				}

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
	},
};
