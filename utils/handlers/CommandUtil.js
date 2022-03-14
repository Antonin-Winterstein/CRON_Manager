const { promisify } = require("util");
const { glob } = require("glob");
const pGlob = promisify(glob);

module.exports = async (Client) => {
	// Donne le chemin absolu (current working directory)
	(await pGlob(`${process.cwd()}/commands/*/*.js`)).map(async (cmdFile) => {
		const cmd = require(cmdFile);

		if (!cmd.name || !cmd.description)
			return console.log(
				`-----\nCommand not loaded:  no name and/or description\nFile -> ${cmdFile}\n-----`
			);
		Client.commands.set(cmd.name, cmd);
		console.log(`Command loaded: ${cmd.name}`);
	});
};
