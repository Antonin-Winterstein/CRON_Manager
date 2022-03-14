const cronSchema = require("../../models/cronSchema");
const DiscordJS = require("discord.js");

module.exports = {
	name: "updatecron",
	description: "Updates the CRON selected.",
	options: [
		{
			name: "id",
			description: "The Id of the CRON.",
			required: true,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "channel",
			description: "The channel in which the message will be sent.",
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.CHANNEL,
		},
		{
			name: "time",
			description: "The time when the message will be sent.",
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
		{
			name: "message",
			description: "The message you want to send.",
			required: false,
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
		},
	],
	async runSlash(Client, interaction) {
		let isMemberAdmin = interaction.memberPermissions.has("ADMINISTRATOR");

		if (isMemberAdmin == true) {
			const sentId = interaction.options.getString("id");
			let sentChannel = interaction.options.getChannel("channel");
			let sentTime = interaction.options.getString("time");
			let sentMessage = interaction.options.getString("message");

			let timeRegex = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$";

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
						if (
							sentChannel == null &&
							sentTime == null &&
							sentMessage == null
						) {
							interaction.reply({
								content:
									"The CRON hasn't been modified since you haven't filled any fields.",
								ephemeral: true,
							});
						} else if (sentTime != null && sentTime.match(timeRegex) == null) {
							interaction.reply({
								content:
									"The format of the time you sent is wrong, it should be like this: **HH:MM** (Example: 09:21)",
								ephemeral: true,
							});
						} else {
							if (sentChannel == null) {
								sentChannel = channel;
							} else {
								sentChannel = sentChannel.id;
							}
							if (sentTime == null) {
								sentTime = time;
							}
							if (sentMessage == null) {
								sentMessage = message;
							}
							const updateResults = await cronSchema.updateOne(
								{
									_id: sentId,
								},
								{
									$set: {
										channelId: sentChannel,
										time: sentTime,
										message: sentMessage,
									},
								}
							);

							if (updateResults.modifiedCount != 0) {
								interaction.reply({
									content: "The CRON has been successfully updated.",
									ephemeral: true,
								});
							} else {
								interaction.reply({
									content: "No changes were noted for the CRON.",
									ephemeral: true,
								});
							}
						}
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
