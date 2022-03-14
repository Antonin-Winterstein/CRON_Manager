const prefix = "!";

module.exports = {
	name: "messageCreate",
	once: false,
	execute(Client, message) {
		if (message.author.bot) return;
		if (!message.content.startsWith(prefix)) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const cmdName = args.shift().toLowerCase();

		if (cmdName.length == 0) return;

		let cmd = Client.commands.get(cmdName);
		if (cmd) cmd.run(Client, message, args);
	},
};
