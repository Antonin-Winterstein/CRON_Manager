const DiscordJS = require("discord.js");
const Client = new DiscordJS.Client({
	intents: [
		DiscordJS.Intents.FLAGS.GUILDS,
		DiscordJS.Intents.FLAGS.GUILD_MESSAGES,
	],
});
require("dotenv").config();
const mongoose = require("mongoose");

Client.commands = new DiscordJS.Collection();

["CommandUtil", "EventUtil"].forEach((handler) => {
	require(`./utils/handlers/${handler}`)(Client);
});

// Connexion à MongoDB
mongoose
	.connect(process.env.MONGO_URI, {
		keepAlive: true,
	})
	.then(() => {
		console.log("Connected to database.");
	})
	.catch((err) => {
		console.log(err);
	});

// Informations et contrôle sur le processus avec renvoi de messages d'erreur
process.on("exit", (code) => {
	console.log(`The process stoppeed with the code: ${code}!`);
});
process.on("uncaughtException", (err, origin) => {
	console.log(`UNCAUGHT_EXCEPTION: ${err}`, `Origin: ${origin}`);
});
process.on("unhandledRejection", (reason, promise) => {
	console.log(`UNHANDLED_REJECTION: ${reason}\n-----\n`, promise);
});
process.on("warning", (...args) => console.log(...args));

// Connexion du bot
Client.login(process.env.DISCORD_TOKEN);
