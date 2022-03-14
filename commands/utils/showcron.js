const cronSchema = require("../../models/cronSchema");
const DiscordJS = require("discord.js");

module.exports = {
	name: "showcron",
	description: "Shows the selected CRON.",
	userPermissions: ["ADMINISTRATOR"],
	options: [
		{
			name: "id",
			description: "The Id of the CRON.",
			required: true,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
	],
	async runSlash(Client, interaction) {
		let isMemberAdmin = interaction.memberPermissions.has("ADMINISTRATOR");

		// Commande seulement disponible aux administrateurs
		if (isMemberAdmin == true) {
			const sentId = interaction.options.getString("id");

			if (sentId.match(/^[0-9a-fA-F]{24}$/)) {
				const findByIdResults = await cronSchema.findById({ _id: sentId });

				if (findByIdResults != null) {
					const post = findByIdResults;
					const { _id, time, message, guildId, channelId, isActive } = post;

					const guild = await Client.guilds.fetch(guildId);
					const channel = guild.channels.cache.get(channelId);
					if (!guild || !channel) {
						interaction.reply({
							content: "An error occured. Please contact the creator.",
							ephemeral: true,
						});
					} else {
						interaction.reply({
							content: `__**Id:**__ ${_id}\n__**Channel:**__ ${channel}\n__**Time:**__ ${time}\n__**Message:**__ ${message}\n\n`,
							ephemeral: true,
						});
					}
				} else {
					interaction.reply({
						content: "No CRON found for this Id.",
						ephemeral: true,
					});
				}
			} else {
				interaction.reply({
					content: "No CRON found for this Id.",
					ephemeral: true,
				});
			}
		} else {
			interaction.reply("You are not allowed to use this command.");
		}
	},
};
