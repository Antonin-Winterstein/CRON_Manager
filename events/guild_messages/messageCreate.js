// Pas besoin de cet événement car il ne fonctionne qu'avec les commandes nécessitant un préfixe or on utilise les slash commands

// Le préfixe qu'on souhaite utiliser pour nos commandes Discord
const prefix = "!";

module.exports = {
	name: "messageCreate",
	once: false,
	execute(Client, message) {
		// Permet de vérifier que la réponse n'est pas un bot sinon cela boucle sans fin
		if (message.author.bot) return;
		// Permet de ne pas récupérer les messages n'ayant pas le préfixe
		if (!message.content.startsWith(prefix)) return;

		// Permet de récupérer tout ce qui se trouve après le préfixe (nom de la commande, arguments etc.)
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const cmdName = args.shift().toLowerCase();

		if (cmdName.length == 0) return;

		// Permet de récupérer le nom de la commande
		let cmd = Client.commands.get(cmdName);

		// À décommenter pour utiliser les commandes avec préfixe et les exécuter
		// if (cmd) cmd.run(Client, message, args);
	},
};
