const cronSchema = require("../../models/cronSchema");

module.exports = {
	name: "showallcron",
	description: "Shows all the CRONs activated on the server.",
	async runSlash(Client, interaction) {
		let isMemberAdmin = interaction.memberPermissions.has("ADMINISTRATOR");

		if (isMemberAdmin == true) {
			const findResults = await cronSchema.find({
				guildId: interaction.guildId,
			});
			let replyContent;

			if (typeof findResults !== "undefined" && findResults.length > 0) {
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

					if (replyContent == undefined) {
						replyContent = `__**Id:**__ ${_id}\n__**Channel:**__ ${channel}\n__**Time:**__ ${time}\n__**Message:**__ ${message}\n\n`;
					} else {
						replyContent =
							replyContent +
							`__**Id:**__ ${_id}\n__**Channel:**__ ${channel}\n__**Time:**__ ${time}\n__**Message:**__ ${message}\n\n`;
					}
				}
				interaction.reply({
					content: replyContent,
					ephemeral: true,
				});
			} else {
				interaction.reply({
					content: "No CRON found on this server. Please try to create one.",
					ephemeral: true,
				});
			}
		} else {
			interaction.reply("You are not allowed to use this command.");
		}
	},
};
