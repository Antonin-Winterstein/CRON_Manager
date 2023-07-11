const DiscordJS = require("discord.js");
const Client = new DiscordJS.Client({
	intents: [
		DiscordJS.Intents.FLAGS.GUILDS,
		DiscordJS.Intents.FLAGS.GUILD_MESSAGES,
	],
});
require("dotenv").config();
const mongoose = require("mongoose");
const Logger = require("./utils/Logger");

Client.commands = new DiscordJS.Collection();

["CommandUtil", "EventUtil"].forEach((handler) => {
	require(`./utils/handlers/${handler}`)(Client);
});

// Informations et contrôle sur le processus avec renvoi de messages d'erreur
process.on("exit", (code) => {
	Logger.client(`The process stopped with the code: ${code}!`);
});
process.on("uncaughtException", (err, origin) => {
	Logger.error(`UNCAUGHT_EXCEPTION: ${err}`);
	console.error(`Origin: ${origin}`);
});
process.on("unhandledRejection", (reason, promise) => {
	Logger.warn(`UNHANDLED_REJECTION: ${reason}`);
	console.log(promise);
});
process.on("warning", (...args) => Logger.warn(...args));

// Connexion à MongoDB
mongoose
	.connect(process.env.MONGO_URI, {
		keepAlive: true,
	})
	.then(() => {
		Logger.client("- connected to database.");
	})
	.catch((err) => {
		Logger.error(err);
	});

// Connexion du bot
Client.login(process.env.DISCORD_TOKEN);
