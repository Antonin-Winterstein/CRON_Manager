const cronSchema = require("../../models/cronSchema");
const DiscordJS = require("discord.js");

module.exports = {
	name: "deletecron",
	description: "Deletes the CRON selected.",
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
				let deleteOneResults = await cronSchema.deleteOne({ _id: sentId });

				if (deleteOneResults.deletedCount != 0) {
					interaction.reply({
						content: "The CRON has been successfully deleted.",
						ephemeral: true,
					});
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
