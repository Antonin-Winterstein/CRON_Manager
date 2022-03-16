const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "ping",
	category: "utils",
	description: "Returns the latency of the bot and the API.",
	userPermissions: ["SEND_MESSAGES"],
	usage: "ping",
	examples: ["ping"],
	// run(Client, message, args) {
	// 	message.channel.send("Pong!");
	// },
	async runInteraction(Client, interaction) {
		const tryPong = await interaction.reply({
			content: "We're trying to pong... wait a minute!",
			fetchReply: true,
		});

		const embed = new MessageEmbed()
			.setTitle("🏓 Pong!")
			.setThumbnail(Client.user.displayAvatarURL())
			.addFields(
				{
					name: "API Latency",
					value: `\`\`\`${Client.ws.ping}ms\`\`\``,
					inline: true,
				},
				{
					name: "BOT Latency",
					value: `\`\`\`${
						tryPong.createdTimestamp - interaction.createdTimestamp
					}ms\`\`\``,
					inline: true,
				}
			)
			.setTimestamp()
			.setFooter({
				text: interaction.user.username,
				iconURL: interaction.user.displayAvatarURL(),
			});

		interaction.editReply({ content: " ", embeds: [embed] });
	},
};
