const { promisify } = require("util");
const { glob } = require("glob");
const pGlob = promisify(glob);
const Logger = require("../Logger");

module.exports = async (Client) => {
	// Permet d'itérer sur autant de fichiers en ".js" trouvés dans le répertoire des "commands" (cwd = current working directory, donne le chemin absolu) grâce à l'utilisation de "glob" qui le permet simplement. Cela retourne la méthode sous forme de promesse grâce à "promisify"
	(await pGlob(`${process.cwd()}/commands/*/*.js`)).map(async (cmdFile) => {
		const cmd = require(cmdFile);

		// Message d'erreur s'il manque le nom pour la commande
		if (!cmd.name)
			return Logger.warn(
				`Command not loaded:  nameless, add a name to your command ↓\nFile -> ${cmdFile}`
			);

		// Message d'erreur s'il manque la description pour la commande
		if (!cmd.description && cmd.type != "USER")
			return Logger.warn(
				`Command not loaded:  no description, add a description to your command ↓\nFile -> ${cmdFile}`
			);

		// Message d'erreur s'il manque la catégorie pour la commande
		if (!cmd.category)
			return Logger.warn(
				`Command not loaded:  no category, add a category to your command ↓\nFile -> ${cmdFile}`
			);

		// Si la commande a une permission spécifiée, on la désactive de base pour tout le monde (y compris les adminisrateurs)
		if (cmd.userPermissions) cmd.defaultPermission = false;

		// Chargement de la commande trouvée
		Client.commands.set(cmd.name, cmd);
		Logger.command(`- ${cmd.name}`);
	});
};
