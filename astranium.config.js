const { GatewayIntentBits, Options, Partials } = require("discord.js");

const { config } = require("dotenv");
const { name, version } = require("./package.json");

config();

/**
 * Configuration options for the Astranium client.
 * @type {import("./src/lib/Client").AstraniumConfig}
 */
module.exports = {
    clientID: process.env.CLIENT_ID,
    clientOptions: {
        intents: [
            GatewayIntentBits.AutoModerationConfiguration,
            GatewayIntentBits.AutoModerationExecution,
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.DirectMessageTyping,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildBans,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildInvites,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildScheduledEvents,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildWebhooks,
            GatewayIntentBits.Guilds,
            GatewayIntentBits.MessageContent
        ],
        makeCache: Options.cacheEverything(),
        partials: [
            Partials.Channel,
            Partials.GuildMember,
            Partials.GuildScheduledEvent,
            Partials.Message,
            Partials.Reaction
        ]
    },
    guildID: process.env.GUILD_ID,
    name: name[0].toUpperCase() + name.slice(1),
    owners: [
        "921906726817644594", // tncz
    ],
    release: "Alpha",
    token: process.env.TOKEN,
    version
};
