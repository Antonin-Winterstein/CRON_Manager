const { MessageEmbed } = require("discord.js");
const DiscordJS = require("discord.js");
const { readdirSync } = require("fs");
const commandFolder = readdirSync("./commands");

module.exports = {
	name: "help",
	category: "utils",
	description: "Displays the help panel with all available commands.",
	options: [
		{
			name: "command",
			description: "The name of the command.",
			type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
			required: false,
		},
	],
	async runInteraction(Client, interaction) {
		const cmdName = interaction.options.getString("command");

		// Si aucune option n'a été remplie
		if (!cmdName) {
			const noArgsEmbed = new MessageEmbed()
				.setColor("#FF00FF")
				.addField(
					"Commands list",
					`List of all categories available with their commands.\nFor more information about a command, enter \`/help <command>\``
				);

			// Boucle pour rajouter un nouveau champ pour chaque catégorie
			for (const category of commandFolder) {
				noArgsEmbed.addField(
					` ${category.replace(/(^\w|\s\w)/g, (firstLetter) =>
						firstLetter.toUpperCase()
					)}`,
					`\`${Client.commands
						.filter((cmd) => cmd.category == category.toLowerCase())
						.map((cmd) => cmd.name)
						.join(", ")}\``
				);
			}

			// On répond à l'utilisateur la liste de toutes les commandes
			return interaction.reply({ embeds: [noArgsEmbed], ephemeral: true });
		}

		// Si une option a été précisée, on va afficher les détails sur celle-ci
		const cmd = Client.commands.get(cmdName);

		// Si la commande n'existe pas on l'indique
		if (!cmd)
			return interaction.reply({
				content: "This command doesn't exist.",
				ephemeral: true,
			});

		let userPermissions;
		// Si on ne trouve pas de permission pour la commande, on affichera dans le embed "NONE"
		if (cmd.userPermissions == undefined) {
			userPermissions = "NONE";
		}
		// Si on trouve une ou plusieurs permissions, on les affichera dans le embed
		else {
			userPermissions = cmd.userPermissions.join(", ");
		}

		// Si elle existe, on crée l'embed
		const argsEmbed = new MessageEmbed()
			.setColor("#FF00FF")
			.setTitle(`\`${cmd.name}\``)
			.setDescription(cmd.description)
			.setFooter({
				text: `Permission(s) needed: ${userPermissions}`,
			});

		// On répond à l'utilisateur les informations sur la commande
		return interaction.reply({ embeds: [argsEmbed], ephemeral: true });
	},
};
