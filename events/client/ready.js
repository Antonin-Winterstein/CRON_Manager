const cronSchema = require("../../models/cronSchema");
const CronJob = require("cron").CronJob;
const Logger = require("../../utils/Logger");

module.exports = {
	name: "ready",
	once: true,
	async execute(Client) {
		Logger.client("- ready to use");

		// Si on redémarre le bot ou qu'il crash tout simplement, on remet la valeur isActive de tous les CRON à false pour qu'ils se remettent par la suite automatiquement à true ce qui permet de lancer les CRON
		cronSchema.updateMany(
			{ isActive: true },
			{ $set: { isActive: false } },
			function (err, result) {
				if (err) {
					console.log("Error updating object: " + err);
				} else {
					// console.log("" + result + " document(s) updated");
				}
			}
		);

		// Constantes temporaires pour le développement avec l'ID du serveur
		const guild = await Client.guilds.cache.get("646033280499580948");
		const arrayOfSlashCommands = Client.commands.map((cmd) => cmd);

		guild.commands.set(arrayOfSlashCommands).then((cmd) => {
			// Récupération des rôles pour la commande
			const getRoles = (commandName) => {
				// Récupération des permissions requises pour la commande
				const permissions = arrayOfSlashCommands.find(
					(x) => x.name === commandName
				).userPermissions;

				// Si la commande n'a pas de permission
				if (!permissions) return null;

				// Si la commande a des permissions on récupère les rôles
				return guild.roles.cache.filter(
					(x) => x.permissions.has(permissions) && !x.managed
				);
			};

			// Récupération des permissions pour la commande
			const fullPermissions = cmd.reduce((accumulator, x) => {
				// Récupération des rôles pour la commande
				const roles = getRoles(x.name);

				// S'il n'y a pas de rôles
				if (!roles) return accumulator;

				// Définition de toutes les permissions nécessaires
				const permissions = roles.reduce((a, v) => {
					return [
						...a,
						{
							id: v.id,
							type: "ROLE",
							permission: true,
						},
					];
				}, []);

				// On retourne les permissions nécessaires pour la commande
				return [
					...accumulator,
					{
						id: x.id,
						permissions,
					},
				];
			}, []);

			// Met à jour les permissions pour la commande
			guild.commands.permissions.set({ fullPermissions });
		});

		// Fonction qui vérifie si un nouveau CRON a été créé pour l'activer
		const checkForCRON = async () => {
			// Récupérer tous les CRON de la base de données
			const findResults = await cronSchema.find();

			// Boucler sur tous les CRON récupérés
			for (const post of findResults) {
				const { _id, time, message, guildId, channelId, isActive } = post;

				const guild = await Client.guilds.fetch(guildId);
				if (!guild) {
					continue;
				}

				const channel = guild.channels.cache.get(channelId);
				if (!channel) {
					continue;
				}

				// Récupérer les minutes et heures
				let hours = time.split(":")[0];
				let minutes = time.split(":")[1];

				// Si le CRON n'est pas actif, on l'active
				if (isActive == false) {
					new CronJob(
						`1 ${minutes} ${hours} * * *`,
						function () {
							channel.send(message);
						},
						null,
						true,
						"Europe/Paris"
					);

					// On actualise le statut du CRON en actif
					cronSchema.updateOne(
						{ _id: _id },
						{ $set: { isActive: true } },
						function (err, result) {
							if (err) {
								console.log("Error updating object: " + err);
							} else {
								// console.log("" + result + " document(s) updated");
							}
						}
					);
				}
			}
			// Toutes les 10 secondes, on rappelle cette même fonction pour vérifier si un nouveau CRON a été créé pour ainsi l'activer
			setTimeout(checkForCRON, 1000 * 10);
		};

		// On appelle la fonction qui active les CRON
		checkForCRON();
	},
};
