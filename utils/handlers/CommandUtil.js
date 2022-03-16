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

		// Message d'erreur s'il manque les permissions pour la commande
		if (!cmd.userPermissions)
			return Logger.warn(
				`Command not loaded:  no permission, add at least one to your command ↓\nFile -> ${cmdFile}`
			);

		// Message d'erreur s'il manque les utilisations pour la commande
		if (!cmd.usage)
			return Logger.warn(
				`Command not loaded:  no usage, add at least one to your command ↓\nFile -> ${cmdFile}`
			);

		// Message d'erreur s'il manque les exemples pour la commande
		if (!cmd.examples)
			return Logger.warn(
				`Command not loaded:  no example, add at least one to your command ↓\nFile -> ${cmdFile}`
			);

		// Message d'erreur si la permission a un problème de typographie
		cmd.userPermissions.forEach((userPermission) => {
			if (!userPermissionList.includes(userPermission)) {
				return Logger.typo(
					`Command not loaded:  typography error on the permission '${userPermission}' ↓\nFile -> ${cmdFile}`
				);
			}
		});

		// Si la commande a une permission spécifiée, on la désactive de base pour tout le monde (y compris les adminisrateurs)
		if (cmd.userPermissions) cmd.defaultPermission = false;

		// Chargement de la commande trouvée
		Client.commands.set(cmd.name, cmd);
		Logger.command(`- ${cmd.name}`);
	});
};

const userPermissionList = [
	"CREATE_INSTANT_INVITE",
	"KICK_MEMBERS",
	"BAN_MEMBERS",
	"ADMINISTRATOR",
	"MANAGE_CHANNELS",
	"MANAGE_GUILD",
	"ADD_REACTIONS",
	"VIEW_AUDIT_LOG",
	"PRIORITY_SPEAKER",
	"STREAM",
	"VIEW_CHANNEL",
	"SEND_MESSAGES",
	"SEND_TTS_MESSAGES",
	"MANAGE_MESSAGES",
	"EMBED_LINKS",
	"ATTACH_FILES",
	"READ_MESSAGE_HISTORY",
	"MENTION_EVERYONE",
	"USE_EXTERNAL_EMOJIS",
	"VIEW_GUILD_INSIGHTS",
	"CONNECT",
	"SPEAK",
	"MUTE_MEMBERS",
	"DEAFEN_MEMBERS",
	"MOVE_MEMBERS",
	"USE_VAD",
	"CHANGE_NICKNAME",
	"MANAGE_NICKNAMES",
	"MANAGE_ROLES",
	"MANAGE_WEBHOOKS",
	"MANAGE_EMOJIS_AND_STICKERS",
	"USE_APPLICATION_COMMANDS",
	"REQUEST_TO_SPEAK",
	"MANAGE_EVENTS",
	"MANAGE_THREADS",
	"USE_PUBLIC_THREADS",
	"CREATE_PUBLIC_THREADS",
	"USE_PRIVATE_THREADS",
	"CREATE_PRIVATE_THREADS",
	"USE_EXTERNAL_STICKERS",
	"SEND_MESSAGES_IN_THREADS",
	"START_EMBEDDED_ACTIVITIES",
	"MODERATE_MEMBERS",
];
