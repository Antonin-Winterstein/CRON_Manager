const ObjectId = require("mongodb").ObjectId;
const CronJobManager = require("../../utils/cronJobManager");

module.exports = {
	name: "channelDelete",
	once: false,
	async execute(Client, channel) {
		console.log(channel.id);
		console.log(channel.guildId);
	},
};
