module.exports = {
	name: "help",
	description: "This is an help command.",
	execute(message, args, DiscordJS) {
		const embed = new DiscordJS.MessageEmbed()
			.setColor("#FF00FF")
			.setTitle("All commands")
			.setURL("https://discord.js.org/")
			.setAuthor({
				name: "Iparenzo",
				iconURL: "https://i.imgur.com/AfFp7pu.png",
				url: "https://discord.js.org",
			})
			.setDescription("This is the list of all commands")
			.setThumbnail("https://i.imgur.com/AfFp7pu.png")
			.addFields(
				{ name: "__help__", value: "Show the list of all commands" },
				{ name: "__ping__", value: "Answer pong" }
			)
			.setImage("https://i.imgur.com/AfFp7pu.png")
			.setTimestamp()
			.setFooter({
				text: "Bot created by Iparenzo",
				iconURL: "https://i.imgur.com/AfFp7pu.png",
			});

		message.channel.send({ embeds: [embed] });
	},
};
