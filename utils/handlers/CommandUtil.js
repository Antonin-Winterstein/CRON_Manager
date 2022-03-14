const { promisify } = require("util");
const { glob } = require("glob");
const pGlob = promisify(glob);

module.exports = async (Client) => {
	// Permet d'itérer sur autant de fichiers en ".js" trouvés dans le répertoire des "commands" (cwd = current working directory, donne le chemin absolu) grâce à l'utilisation de "glob" qui le permet simplement. Cela retourne la méthode sous forme de promesse grâce à "promisify"
	(await pGlob(`${process.cwd()}/commands/*/*.js`)).map(async (cmdFile) => {
		const cmd = require(cmdFile);

		// Message d'erreur s'il manque le nom ou la description pour la commande
		if (!cmd.name || !cmd.description)
			return console.log(
				`-----\nCommand not loaded:  no name and/or description\nFile -> ${cmdFile}\n-----`
			);

		if (cmd.userPermissions) cmd.defaultPermission = false;

		// Chargement de la commande trouvée
		Client.commands.set(cmd.name, cmd);
		console.log(`Command loaded: ${cmd.name}`);
	});
};
