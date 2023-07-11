const mongoose = require("mongoose");

const monthsData = new mongoose.Schema({
	month: { type: String, required: true }, // Le mois où le message doit être énvoyé
	startDay: { type: Number, default: null, required: true }, // Quel jour de la semaine sur le mois le CRON doit commencé à envoyer
});

// Création du schéma pour les CRON
const cronData = new mongoose.Schema({
	time: { type: String, required: true }, // Heure d'envoi du message
	days: {
		type: [String],
		default: ["ALL"],
		required: true,
	}, // Le(s) jour(s) où le message doit être énvoyé
	months: {
		type: [monthsData],
		default: ["ALL"],
		required: true,
	}, // Le(s) mois où le message doit être énvoyé
	daysOfWeek: {
		type: [String],
		default: ["ALL"],
		required: true,
	}, // Le(s) jour(s) de la semaine où le message doit être envoyé
	message: { type: String, required: true }, // Contenu du message à envoyer
	channelId: { type: String, required: true }, // Id du channel où le message doit s'envoyer
	weekInterval: { type: Number, default: 1, required: true }, // L'intervalle de semaines à laquelle le message doit s'envoyer
	startTime: { type: String, required: true }, // Le jour auquel le CRON a été initialisé, permet de pouvoir gérer l'intervalle de semaines
	timeZone: { type: String, default: "Europe/Paris", required: true }, // La time zone à prendre en compte pour l'envoi du message, lists des ID TZ ici : https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
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
