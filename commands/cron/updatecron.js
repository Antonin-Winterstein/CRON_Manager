const { Guild } = require("../../models/index");
const DiscordJS = require("discord.js");

module.exports = {
	name: "updatecron",
	category: "cron",
	description:
		"Updates the selected CRON using its identifier if at least one optional option is filled.",
	userPermissions: ["ADMINISTRATOR"],
	usage: "updatecron [identifier] <channel> <time> <message>",
	examples: [
		"updatecron [622ea01f78ef802465cda7d4] <yourchannel> <09:21> <Hello World!>",
		"updatecron [622ea01f78ef802465cda7d4] <yourchannel> <09:21> ",
		"updatecron [622ea01f78ef802465cda7d4] <Hello World!>",
	],
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
	async runInteraction(Client, interaction) {
		// Récupération des données envoyées par l'utilisateur
		const sentId = interaction.options.getString("id");
		let sentChannel = interaction.options.getChannel("channel");
		let sentTime = interaction.options.getString("time");
		let sentMessage = interaction.options.getString("message");

		// Regex qui permet de respecter le format HH:MM
		let timeRegex = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$";

		// Si le format de l'ID est respecté
		if (sentId.match(/^[0-9a-fA-F]{24}$/)) {
			// On récupère les données pour l'ID envoyé par l'utilisateur sur son serveur
			const findOneResults = await Guild.findOne(
				{ _id: interaction.guildId },
				{ crons: { $elemMatch: { _id: sentId } } }
			);

			const guild = await Client.guilds.fetch(interaction.guildId);
			const cron = findOneResults.crons;

			// Si on récupère des données
			if (typeof cron !== "undefined" && cron.length > 0) {
				for (const cronData of cron) {
					const { time, message, channelId, isActive, _id } = cronData;

					const channel = guild.channels.cache.get(channelId);
					if (!channel) {
						continue;
					}

					// Si on arrive pas à récupérer l'Id du serveur ou du channel, on affiche une erreur à l'utilisateur
					if (!guild || !channel) {
						interaction.reply({
							content: "An error occured. Please contact the creator.",
							ephemeral: true,
						});
					}
					// S'il n'y a pas d'erreur, on va modifier les données
					else {
						// Si aucun champ facultatif n'a été saisi, on indique à l'utilisateur qu'il n'y a pas eu de modifications
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
						}
						// Si le format pour "time" n'est pas respecté
						else if (sentTime != null && sentTime.match(timeRegex) == null) {
							// On indique que le format n'est pas le bon
							interaction.reply({
								content:
									"The format of the time you sent is wrong, it should be like this: **HH:mm** (Example: 09:21)",
								ephemeral: true,
							});
						} else {
							// Si l'utilisateur n'a pas rempli l'option "channel", on remet celui de base qu'on retrouve en BDD
							if (sentChannel == null) {
								sentChannel = channel;
							} else {
								sentChannel = sentChannel.id;
							}
							// Si l'utilisateur n'a pas rempli l'option "time", on remet celui de base qu'on retrouve en BDD
							if (sentTime == null) {
								sentTime = time;
							}

							// Si l'utilisateur n'a pas rempli l'option "message", on remet celui de base qu'on retrouve en BDD
							if (sentMessage == null) {
								sentMessage = message;
							}

							// On modifie le CRON de la BDD avec les valeurs saisies par l'utilisateur
							const updateResults = await Guild.updateOne(
								{ _id: interaction.guildId, "crons._id": _id },
								{
									$set: {
										"crons.$.channelId": sentChannel,
										"crons.$.time": sentTime,
										"crons.$.message": sentMessage,
									},
								}
							);

							// Si on a effectivement modifié quelque chose de la BDD, on précise que le CRON a bien été modifié
							if (updateResults.modifiedCount != 0) {
								interaction.reply({
									content: "The CRON has been successfully updated.",
									ephemeral: true,
								});
							}
							// Sinon, on indique qu'aucun changement n'a été relevé
							else {
								interaction.reply({
									content: "No changes were noted for the CRON.",
									ephemeral: true,
								});
							}
						}
					}
				}
			}
			// Si on ne récupère pas de données, cela veut dire que l'ID n'était pas bon et on l'indique à l'utilisateur
			else {
				interaction.reply({
					content: "No CRON found for this Id.",
					ephemeral: true,
				});
			}
		}
		// Si le format de l'ID n'est pas respecté, on l'indique à l'utilisateur
		else {
			interaction.reply({
				content: "No CRON found for this Id.",
				ephemeral: true,
			});
		}
	},
};
