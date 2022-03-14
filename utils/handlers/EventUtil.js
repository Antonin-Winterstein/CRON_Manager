const { promisify } = require("util");
const { glob } = require("glob");
const pGlob = promisify(glob);

module.exports = async (Client) => {
	// Donne le chemin absolu (current working directory)
	(await pGlob(`${process.cwd()}/events/*/*.js`)).map(async (eventFile) => {
		const event = require(eventFile);

		if (!eventList.includes(event.name) || !event.name) {
			return console.log(
				`-----\nEvent not triggered: typography error (or nameless)\nFile -> ${eventFile}\n-----`
			);
		}

		if (event.once) {
			Client.once(event.name, (...args) => event.execute(Client, ...args));
		} else {
			Client.on(event.name, (...args) => event.execute(Client, ...args));
		}

		console.log(`Event loaded: ${event.name}`);
	});
};

const eventList = [
	"apiRequest",
	"apiResponse",
	"applicationCommandCreate",
	"applicationCommandDelete",
	"applicationCommandUpdate",
	"channelCreate",
	"channelDelete",
	"channelPinsUpdate",
	"channelUpdate",
	"debug",
	"emojiCreate",
	"emojiDelete",
	"emojiUpdate",
	"error",
	"guildBanAdd",
	"guildBanRemove",
	"guildCreate",
	"guildDelete",
	"guildIntegrationsUpdate",
	"guildMemberAdd",
	"guildMemberAvailable",
	"guildMemberRemove",
	"guildMembersChunk",
	"guildMemberUpdate",
	"guildScheduledEventCreate",
	"guildScheduledEventDelete",
	"guildScheduledEventUpdate",
	"guildScheduledEventUserAdd",
	"guildScheduledEventUserRemove",
	"guildUnavailable",
	"guildUpdate",
	"interaction",
	"interactionCreate",
	"invalidated",
	"invalidRequestWarning",
	"inviteCreate",
	"inviteDelete",
	"message",
	"messageCreate",
	"messageDelete",
	"messageDeleteBulk",
	"messageReactionAdd",
	"messageReactionRemove",
	"messageReactionRemoveAll",
	"messageReactionRemoveEmoji",
	"messageUpdate",
	"presenceUpdate",
	"rateLimit",
	"ready",
	"roleCreate",
	"roleDelete",
	"roleUpdate",
	"shardDisconnect",
	"shardError",
	"shardReady",
	"shardReconnecting",
	"shardResume",
	"stageInstanceCreate",
	"stageInstanceDelete",
	"stageInstanceUpdate",
	"stickerCreate",
	"stickerDelete",
	"stickerUpdate",
	"threadCreate",
	"threadDelete",
	"threadListSync",
	"threadMembersUpdate",
	"threadMemberUpdate",
	"threadUpdate",
	"typingStart",
	"userUpdate",
	"voiceStateUpdate",
	"warn",
	"webhookUpdate",
];
