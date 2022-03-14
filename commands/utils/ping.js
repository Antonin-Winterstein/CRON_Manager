const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "ping",
	description: "This is a ping command.",
	// run: (Client, message, args) => {
	// 	message.channel.send("Pong!");
	// },
	runSlash: (Client, interaction) => {
		const embed = new MessageEmbed()
			.setTitle("🏓 Pong!")
			.setThumbnail(Client.user.displayAvatarURL())
			.addFields(
				{ name: "Latency", value: `\`${Client.ws.ping}ms\``, inline: true },
				{
					name: "Uptime",
					value: `<t:${parseInt(Client.readyTimestamp / 1000)}:R>`,
					inline: true,
				}
			)
			.setTimestamp()
			.setFooter({
				text: interaction.user.username,
				iconURL: interaction.user.displayAvatarURL(),
			});

		interaction.reply({ embeds: [embed] });
	},
};
