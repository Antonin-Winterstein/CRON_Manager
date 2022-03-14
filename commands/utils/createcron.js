const cronSchema = require("../../models/cronSchema");
const DiscordJS = require("discord.js");

module.exports = {
	name: "createcron",
	description: "Defines a CRON to a specific hour.",
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

		if (isMemberAdmin == true) {
			const sentChannel = interaction.options.getChannel("channel");
			const sentTime = interaction.options.getString("time");
			const sentMessage = interaction.options.getString("message");

			let timeRegex = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$";

			if (sentTime.match(timeRegex) != null) {
				await new cronSchema({
					time: sentTime,
					message: sentMessage,
					guildId: interaction.guildId,
					channelId: sentChannel.id,
					isActive: false,
				}).save();

				interaction.reply({
					content: `__**You added the following message:**__ ${sentMessage}\n__**To this channel:**__ ${sentChannel}\n__**For this time:**__ ${sentTime}`,
					ephemeral: true,
				});
			} else {
				interaction.reply({
					content:
						"The format of the time you sent is wrong, it should be like this: **HH:MM** (Example: 09:21)",
					ephemeral: true,
				});
			}
		} else {
			interaction.reply("You are not allowed to use this command.");
		}
	},
};
