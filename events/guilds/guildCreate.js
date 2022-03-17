const { Guild } = require("../../models/index");
const Logger = require("../../utils/Logger");

module.exports = {
	name: "guildCreate",
	once: false,
	async execute(Client, guild) {
		const findOneResults = await Guild.findOne({
			_id: guild.id,
		});

		// Si la guilde n'existe pas déjà dans la BDD, on l'ajoute
		if (findOneResults == null) {
			const createGuild = await new Guild({
				_id: guild.id,
				name: guild.name,
			});
			createGuild
				.save()
				.then((g) =>
					Logger.client(
						`- the guild "${g.name}" (Id: ${g._id}) has been added to database`
					)
				);
		} else {
			// On modifie le nom de la guilde de la BDD
			await Guild.updateOne(
				{
					_id: guild.id,
				},
				{
					$set: {
						name: guild.name,
					},
				}
			);

			Logger.client(
				`- the guild "${guild.name}" (Id: ${guild.id}) is already in the database`
			);
		}
	},
};
