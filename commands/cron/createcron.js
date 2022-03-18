const { Guild } = require("../../models/index");
const DiscordJS = require("discord.js");

module.exports = {
	name: "createcron",
	category: "cron",
	description:
		"Creates a CRON that sends a message to a specific hour (format: HH:mm) in a specific channel.",
	userPermissions: ["ADMINISTRATOR"],
	usage: "createcron [channel] [time] [message]",
	examples: ["createcron [yourchannel] [09:21] [Hello World!]"],
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
	async runInteraction(Client, interaction) {
		// Récupération des données envoyées par l'utilisateur
		const sentChannel = interaction.options.getChannel("channel");
		const sentTime = interaction.options.getString("time");
		const sentMessage = interaction.options.getString("message");

		// Regex qui permet de respecter le format HH:MM
		let timeRegex = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$";

		// Si le format pour "time" est respecté
		if (sentTime.match(timeRegex) != null) {
			const guild = await Client.guilds.fetch(interaction.guildId);

			// Si on n'arrive pas à récupérer l'Id du serveur, on affiche une erreur à l'utilisateur
			if (!guild) {
				interaction.reply({
					content:
						"An error occured trying to get your server Id. Please contact the creator.",
					ephemeral: true,
				});
			} else {
				// Créer le CRON
				await Guild.updateOne(
					{
						_id: interaction.guildId,
					},
					{
						$push: {
							crons: {
								time: sentTime,
								message: sentMessage,
								channelId: sentChannel.id,
								isActive: false,
							},
						},
					}
				);
				// On indique que le CRON a été créé avec les paramètres envoyés
				interaction.reply({
					content: `__**You added the following message:**__ ${sentMessage}\n__**To this channel:**__ ${sentChannel}\n__**For this time:**__ ${sentTime}`,
					ephemeral: true,
				});
			}
		}
		// Si le format n'est pas respecté
		else {
			// On indique que le format n'est pas le bon
			interaction.reply({
				content:
					"The format of the time you sent is wrong, it should be like this: **HH:mm** (Example: 09:21)",
				ephemeral: true,
			});
		}
	},
};
