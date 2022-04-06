module.exports = {
	name: "interactionCreate",
	once: false,
	async execute(Client, interaction) {
		if (interaction.isCommand() || interaction.isContextMenu()) {
			const cmd = Client.commands.get(interaction.commandName);
			if (!cmd) return interaction.reply("This command doesn't exist.");

			// Si l'utilisateur n'a pas les permissions pour la slash commande, on lui indique
			if (!interaction.member.permissions.has([cmd.userPermissions]))
				return interaction.reply({
					content: `You do not have permissions to use this command. You must have \`${cmd.userPermissions.join(
						","
					)}\`.`,
					ephemeral: true,
				});

			// Exécuter les slash commandes
			cmd.runInteraction(Client, interaction);
		}
	},
};
