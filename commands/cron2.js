module.exports = {
	name: "cron2",
	description: "This is the cron2.",
	async execute(Client, interaction, options) {
		let isMemberAdmin = interaction.memberPermissions.has("ADMINISTRATOR");

		if (isMemberAdmin == true) {
			message.reply("You have access to this command!");
		} else {
			interaction.reply("You are not allowed to use this command.");
		}
	},
};
