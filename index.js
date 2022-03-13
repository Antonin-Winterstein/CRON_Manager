const DiscordJS = require("discord.js");
const Client = new DiscordJS.Client({
	intents: [
		DiscordJS.Intents.FLAGS.GUILDS,
		DiscordJS.Intents.FLAGS.GUILD_MESSAGES,
	],
});
const mongoose = require("mongoose");
const cronSchema = require("./models/cron-schema");
const CronJob = require("cron").CronJob;
require("dotenv").config();
const prefix = process.env.PREFIX;

// Module File System pour pouvoir accéder aux fichiers
const fs = require("fs");
// const { description } = require("./commands/cron2");
Client.commands = new DiscordJS.Collection();
// On filtre tous les fichiers sauf ceux en .js
const commandFiles = fs
	.readdirSync("./commands/")
	.filter((file) => file.endsWith(".js"));
// Boucler sur tous les fichiers pour récupérer le bon et l'exécuter
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	Client.commands.set(command.name, command);
}

Client.on("ready", async () => {
	console.log("Bot opérationnel !");

	// Connexion à MongoDB
	await mongoose.connect(process.env.MONGO_URI, {
		keepAlive: true,
	});

	// Si on redémarre le bot ou qu'il crash tout simplement, on remet la valeur isActive de tous les CRON à false pour qu'ils se remettent par la suite automatiquement à true ce qui permet de lancer les CRON
	cronSchema.updateMany(
		{ isActive: true },
		{ $set: { isActive: false } },
		function (err, result) {
			if (err) {
				console.log("Error updating object: " + err);
			} else {
				// console.log("" + result + " document(s) updated");
			}
		}
	);

	// 646033280499580948
	const guildId = "646033280499580948";
	const guild = Client.guilds.cache.get(guildId);

	let commands;

	if (guild) {
		commands = guild.commands;
	} else {
		commands = Client.application.commands;
	}

	commands.create({
		name: "createcron",
		description: "Defines a CRON to a specific hour.",
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
	});

	commands.create({
		name: "showallcron",
		description: "Shows all the CRONs activated on the server.",
	});

	commands.create({
		name: "showcron",
		description: "Shows the selected CRON.",
		options: [
			{
				name: "id",
				description: "The Id of the CRON.",
				required: true,
				type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
			},
		],
	});

	commands.create({
		name: "deletecron",
		description: "Deletes the CRON selected.",
		options: [
			{
				name: "id",
				description: "The Id of the CRON.",
				required: true,
				type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
			},
		],
	});

	commands.create({
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
	});

	const checkForCRON = async () => {
		const results = await cronSchema.find();

		for (const post of results) {
			const { _id, time, message, guildId, channelId, isActive } = post;

			const guild = await Client.guilds.fetch(guildId);
			if (!guild) {
				continue;
			}

			const channel = guild.channels.cache.get(channelId);
			if (!channel) {
				continue;
			}

			let hours = time.split(":")[0];
			let minutes = time.split(":")[1];

			if (isActive == false) {
				new CronJob(
					`1 ${minutes} ${hours} * * *`,
					function () {
						channel.send(message);
					},
					null,
					true,
					"Europe/Paris"
				);

				cronSchema.updateOne(
					{ _id: _id },
					{ $set: { isActive: true } },
					function (err, result) {
						if (err) {
							console.log("Error updating object: " + err);
						} else {
							// console.log("" + result + " document(s) updated");
						}
					}
				);
			}
		}
		setTimeout(checkForCRON, 1000 * 10);
	};

	checkForCRON();
});

Client.on("messageCreate", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === "ping") {
		Client.commands.get("ping").execute(message, args);
	} else if (command === "help") {
		Client.commands.get("help").execute(message, args, DiscordJS);
	} else if (command === "cron2") {
		Client.commands.get("cron2").execute(message, args, DiscordJS);
	}
});

Client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) {
		return;
	}

	const { commandName, options } = interaction;

	let isMemberAdmin = interaction.memberPermissions.has("ADMINISTRATOR");

	// Commandes seulement autorisées pour les administrateurs
	if (isMemberAdmin == true) {
		if (commandName === "createcron") {
			const sentChannel = options.getChannel("channel");
			const sentTime = options.getString("time");
			const sentMessage = options.getString("message");

			let timeRegex = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$";

			if (sentTime.match(timeRegex) != null) {
				await new cronSchema({
					time: sentTime,
					message: sentMessage,
					guildId: interaction.guildId,
					channelId: sentChannel.id,
					isActive: false,
				}).save();

				interaction.reply({
					content: `__**You added the following message :**__ ${sentMessage}\n__**To this channel :**__ ${sentChannel}\n__**For this time :**__ ${sentTime}`,
					ephemeral: true,
				});
			} else {
				interaction.reply({
					content:
						"The format of the time you sent is wrong, it should be like this : **HH:MM** (Example : 09:21)",
					ephemeral: true,
				});
			}
		} else if (commandName === "showallcron") {
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
						replyContent = `__**Id :**__ ${_id}\n__**Channel :**__ ${channel}\n__**Time :**__ ${time}\n__**Message :**__ ${message}\n\n`;
					} else {
						replyContent =
							replyContent +
							`__**Id :**__ ${_id}\n__**Channel :**__ ${channel}\n__**Time :**__ ${time}\n__**Message :**__ ${message}\n\n`;
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
		} else if (commandName === "showcron") {
			const sentId = options.getString("id");

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
						interaction.reply({
							content: `__**Id :**__ ${_id}\n__**Channel :**__ ${channel}\n__**Time :**__ ${time}\n__**Message :**__ ${message}\n\n`,
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
				interaction.reply({
					content: "Incorrect syntax used.",
					ephemeral: true,
				});
			}
		} else if (commandName === "deletecron") {
			const sentId = options.getString("id");

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
					content: "Incorrect syntax used.",
					ephemeral: true,
				});
			}
		} else if (commandName === "updatecron") {
			const sentId = options.getString("id");
			let sentChannel = options.getChannel("channel");
			let sentTime = options.getString("time");
			let sentMessage = options.getString("message");

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
									"The format of the time you sent is wrong, it should be like this : **HH:MM** (Example : 09:21)",
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
					content: "Incorrect syntax used.",
					ephemeral: true,
				});
			}
		}
	} else {
		interaction.reply("You are not allowed to use this command.");
	}
});

Client.login(process.env.DISCORD_TOKEN);
