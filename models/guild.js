const mongoose = require("mongoose");

// Création du schéma pour les CRON
const cronData = new mongoose.Schema({
	time: { type: String, required: true }, // Heure d'envoi du message
	message: { type: String, required: true }, // Contenu du message à envoyer
	channelId: { type: String, required: true }, // Id du channel où le message doit s'envoyer
	isActive: { type: Boolean, required: true }, // État du message
});

// Création du schéma pour la BDD MongoDB
const guildSchema = new mongoose.Schema({
	_id: { type: String, required: true }, // Id du serveur
	name: { type: String, required: true }, // Nom du serveur
	crons: {
		type: [cronData],
		default: [],
		required: false,
	},
});

module.exports = mongoose.model("Guild", guildSchema);
