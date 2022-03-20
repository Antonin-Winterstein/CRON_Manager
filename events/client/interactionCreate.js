module.exports = {
	name: "interactionCreate",
	once: false,
	async execute(Client, interaction) {
		if (interaction.isCommand() || interaction.isContextMenu()) {
			const cmd = Client.commands.get(interaction.commandName);
			if (!cmd) return interaction.reply("This command doesn't exist.");

			// Si l'utilisateur n'a pas les permissions en global pour la slash commande, on lui indique
			if (!interaction.member.permissions.has(cmd.userPermissions || []))
				return interaction.followUp({
					content: "You do not have permissions to use this command.",
				});

			// Exécuter les slash commandes
			cmd.runInteraction(Client, interaction);
		}
	},
};
