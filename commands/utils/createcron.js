const cronSchema = require("../../models/cronSchema");
const DiscordJS = require("discord.js");

module.exports = {
	name: "createcron",
	description: "Defines a CRON to a specific hour.",
	userPermissions: ["ADMINISTRATOR"],
	options: [
		{
			name: "channel",
			description: "The channel in which the message will be sent.",
			required: true,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.CHANNEL,
		},
		{
			name: "time",
			description: "The time when the message will be sent.",
			required: true,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "message",
			description: "The message you want to send.",
			required: true,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
	],
	async runSlash(Client, interaction) {
		let isMemberAdmin = interaction.memberPermissions.has("ADMINISTRATOR");

		// Commande seulement disponible aux administrateurs
		if (isMemberAdmin == true) {
			// Récupération des données envoyées par l'utilisateur
			const sentChannel = interaction.options.getChannel("channel");
			const sentTime = interaction.options.getString("time");
			const sentMessage = interaction.options.getString("message");

			// Regex qui permet de respecter le format HH:MM
			let timeRegex = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$";

			// Si le format pour "time" est respecté
			if (sentTime.match(timeRegex) != null) {
				// Créer le CRON
				await new cronSchema({
					time: sentTime,
					message: sentMessage,
					guildId: interaction.guildId,
					channelId: sentChannel.id,
					isActive: false,
				}).save();

				// On indique que le CRON a été créé avec les paramètres envoyés
				interaction.reply({
					content: `__**You added the following message:**__ ${sentMessage}\n__**To this channel:**__ ${sentChannel}\n__**For this time:**__ ${sentTime}`,
					ephemeral: true,
				});
			}
			// Si le format n'est pas respecté
			else {
				// On indique que le format n'est pas le bon
				interaction.reply({
					content:
						"The format of the time you sent is wrong, it should be like this: **HH:MM** (Example: 09:21)",
					ephemeral: true,
				});
			}
		}
		// Si l'utilisateur n'est pas administrateur, on lui indique qu'il n'a pas le droit d'utiliser la commande
		else {
			interaction.reply("You are not allowed to use this command.");
		}
	},
};
