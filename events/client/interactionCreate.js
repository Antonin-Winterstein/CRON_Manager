module.exports = {
	name: "interactionCreate",
	once: false,
	async execute(Client, interaction) {
		if (interaction.isCommand()) {
			const cmd = Client.commands.get(interaction.commandName);
			if (!cmd) return interaction.reply("This command doesn't exist.");
			// Exécuter les slash commandes
			cmd.runSlash(Client, interaction);
		}
	},
};
