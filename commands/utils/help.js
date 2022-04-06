const { MessageEmbed } = require("discord.js");
const DiscordJS = require("discord.js");
const { readdirSync } = require("fs");
const commandFolder = readdirSync("./commands");

module.exports = {
	name: "help",
	category: "utils",
	description:
		"Displays the help panel with all available commands filtered by category.",
	permissions: ["SEND_MESSAGES"],
	usage: "help <command>",
	examples: ["help", "help <createcron>", "help <showallcron>"],
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
			// Contenu du embed
			const noArgsEmbed = new MessageEmbed()
				.setColor("#FF00FF")
				.setTitle("Help panel")
				.setDescription(
					`List of all categories available with their commands.\nFor more information about a command, enter \`/help <command>\``
				)
				.setFooter({
					text: `Total commands: ${
						Client.commands.map((cmd) => cmd.name).length
					}`,
				});

			// Boucle pour rajouter un nouveau champ dans le embed pour chaque catégorie avec ses commandes
			for (const category of commandFolder) {
				noArgsEmbed.addField(
					` ${category.replace(/(^\w|\s\w)/g, (firstLetter) =>
						firstLetter.toUpperCase()
					)} [${
						Client.commands
							.filter((cmd) => cmd.category == category.toLowerCase())
							.map((cmd) => cmd.name).length
					}]`,
					`${Client.commands
						.filter((cmd) => cmd.category == category.toLowerCase())
						.map((cmd) => "`" + cmd.name + "`")
						.join(", ")}`
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

		// On répond à l'utilisateur les informations sur la commande
		return interaction.reply({
			content: `
\`\`\`makefile
[Help: Command -> ${cmd.name}]

${cmd.description ? cmd.description : contextDescription[`${cmd.name}`]}

Use: ${cmd.usage}
Examples: ${cmd.examples.join(` | `)}
Permissions: ${cmd.permissions.join(", ")}

---

{} = available subcommand(s) | [] = mandatory option(s) | <> = optional option(s)
Do not use these characters: {}, [] and <> in your commands.
\`\`\``,
			ephemeral: true,
		});
	},
};
