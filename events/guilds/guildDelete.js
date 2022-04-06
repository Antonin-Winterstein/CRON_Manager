const { Guild } = require("../../models/index");
const Logger = require("../../utils/Logger");

module.exports = {
	name: "guildDelete",
	once: false,
	async execute(Client, guild) {
		// On supprime la guilde de la BDD
		await Guild.deleteOne({
			_id: guild.id,
		});

		Logger.client(
			`- the guild "${guild.name}" (Id: ${guild.id}) is deleted from database`
		);
	},
};
