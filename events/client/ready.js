const { Guild } = require("../../models/index");
const Logger = require("../../utils/Logger");
const CronJobManager = require("../../utils/cronJobManager");

module.exports = {
	name: "ready",
	once: true,
	async execute(Client) {
		// Affiche le nombre de serveurs où le bot est actif avec le total d'utilisateurs
		let guildsCount = await Client.guilds.fetch();
		let usersCount = Client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
		Logger.client(
			`- ready to be used by ${usersCount} users on ${guildsCount.size} servers`
		);

		// Si on redémarre le bot ou qu'il crash tout simplement, on remet la valeur isActive de tous les CRON à false pour qu'ils se remettent par la suite automatiquement à true ce qui permet de lancer les CRON
		await Guild.updateMany(
			{ "crons.isActive": true },
			{ $set: { "crons.$[].isActive": false } },
			{ multi: true }
		);

		// Constante temporaire pour le développement avec l'ID du serveur de développement
		// const guild = await Client.guilds.cache.get("Put your server ID for dev");
		// guild.commands.set(Client.commands.map((cmd) => cmd));
		// Déploiement en global
		Client.application.commands.set(Client.commands.map((cmd) => cmd));

		// On appelle la fonction qui active les CRON
		CronJobManager.checkForCRON(Client);

		// Permet de changer le statut du bot ainsi que son humeur
		Client.user.setPresence({
			activities: [{ name: "every CRON!", type: "LISTENING" }],
			status: "online",
		});
	},
};
