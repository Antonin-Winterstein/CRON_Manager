const mongoose = require("mongoose");

const requiredString = {
	type: String,
	required: true,
};

// Création du schéma pour la BDD MongoDB
const cronSchema = new mongoose.Schema({
	time: requiredString, // Heure d'envoi du message
	message: requiredString, // Contenu du message à envoyer
	guildId: requiredString, // Id du serveur où le message doit s'envoyer
	channelId: requiredString, // Id du channel où le message doit s'envoyer
	isActive: { type: Boolean, required: true }, // État du message
});

const name = "cron";

module.exports = mongoose.model[name] || mongoose.model(name, cronSchema, name);
