const { Guild } = require("../../models/index");
const { MessageEmbed } = require("discord.js");
const DiscordJS = require("discord.js");
const checkIfGuildExists = require("../../utils/checkIfGuildExists");

module.exports = {
	name: "createcron",
	category: "cron",
	description:
		"Creates a CRON that sends a message to a specific hour (format: HH:mm) in a specific channel.",
	permissions: ["ADMINISTRATOR"],
	usage: "createcron [channel] [time] [message]",
	examples: ["createcron [yourchannel] [09:21] [Hello World!]"],
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
	async runInteraction(Client, interaction) {
		// Récupération des données envoyées par l'utilisateur
		const sentChannel = interaction.options.getChannel("channel");
		const sentTime = interaction.options.getString("time");
		const sentMessage = interaction.options.getString("message");

		// Regex qui permet de respecter le format HH:MM
		let timeRegex = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$";

		// Si le format pour "time" est respecté
		if (sentTime.match(timeRegex) != null) {
			const guild = await Client.guilds.fetch(interaction.guildId);

			// Si on n'arrive pas à récupérer l'Id du serveur, on affiche une erreur à l'utilisateur
			if (!guild) {
				interaction.reply({
					content:
						"An error occured trying to get your server Id. Please contact the creator.",
					ephemeral: true,
				});
			} else {
				// On récupère les données du serveur en question
				const findResults = await Guild.find({
					_id: interaction.guildId,
				});

				await checkIfGuildExists.checkIfGuildExists(findResults, interaction);

				// Créer le CRON
				const addCron = await Guild.updateOne(
					{
						_id: interaction.guildId,
					},
					{
						$push: {
							crons: {
								time: sentTime,
								message: sentMessage,
								channelId: sentChannel.id,
								isActive: false,
							},
						},
					}
				);

				// Si on a effectivement ajouté le CRON à la BDD, on précise que le CRON a bien été ajouté
				if (addCron.modifiedCount != 0) {
					// Contenu du embed
					const embedReply = new MessageEmbed()
						.setColor("#00CB54")
						.setDescription("You added the following CRON:")
						.addField("Message", `${sentMessage}`)
						.addField("Channel", `${sentChannel}`)
						.addField("Time", `${sentTime}`)
						.setFooter({
							text: `Added by: ${interaction.member.user.tag}`,
							iconURL: `${interaction.member.user.displayAvatarURL()}`,
						});

					// Affichage du embed à l'utilisateur
					interaction.reply({ embeds: [embedReply], ephemeral: true });
				}
				// Sinon, on indique qu'il y a eu un problème lors de la création du CRON
				else {
					interaction.reply({
						content: "Error happened while trying to add the CRON.",
						ephemeral: true,
					});
				}
			}
		}
		// Si le format n'est pas respecté
		else {
			// On indique que le format n'est pas le bon
			interaction.reply({
				content:
					"The format of the time you sent is wrong, it should be like this: **HH:mm** (Example: 09:21)",
				ephemeral: true,
			});
		}
	},
};
