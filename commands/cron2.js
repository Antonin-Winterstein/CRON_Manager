module.exports = {
	name: "cron2",
	description: "This is the cron2.",
	execute(message, args, DiscordJS) {
		let isMemberAdmin = message.member.permissions.has("ADMINISTRATOR");

		if (isMemberAdmin == true) {
			message.reply("You have access to this command!");
		} else {
			message.reply("You are not allowed to use this command.");
		}
	},
};
