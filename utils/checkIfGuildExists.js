const { Guild } = require("../models/index");
const Logger = require("./Logger");

// Fonction qui vérifie que le serveur existe sur la BDD pour l'ajouter le cas échéant
const checkIfGuildExists = async (guildData, interaction, replyMessage) => {
	// Si on ne trouve pas le serveur dans la BDD, on l'ajoute
	if (guildData.length == 0) {
		const createGuild = await new Guild({
			_id: interaction.guildId,
			name: interaction.guild.name,
		});
		await createGuild
			.save()
			.then((g) =>
				Logger.client(
					`- the guild "${g.name}" (Id: ${g._id}) has been added to database`
				)
			);

		// Si on veut directement répondre à l'utilisateur
		if (replyMessage != undefined) {
			interaction.reply({
				content: replyMessage,
				ephemeral: true,
			});
		}
	}
};

module.exports = { checkIfGuildExists };
