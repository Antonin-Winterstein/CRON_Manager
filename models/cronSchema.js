const mongoose = require("mongoose");

const requiredString = {
	type: String,
	required: true,
};

const cronSchema = new mongoose.Schema({
	time: requiredString,
	message: requiredString,
	guildId: requiredString,
	channelId: requiredString,
	isActive: { type: Boolean, required: true },
});

const name = "cron";

module.exports = mongoose.model[name] || mongoose.model(name, cronSchema, name);
