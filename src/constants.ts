import { Colors, WebhookClient } from "discord.js";

import chalk from "chalk";

export class Constants {
	public static ActivityType = {
		0: "Playing",
		1: "Streaming",
		2: "Listening to",
		3: "Watching",
		4: "Custom",
		5: "Competing in"
	};

	public static Banner = chalk.blue`
                                    ******
                            &*************
                    *********************
            &****************************
        ********************************
    *****************************       *#
    **********************       ********#           .______  ._____________._.______  .______  .______  .___ .____     ._____.___
    ***************       ***************#           :      \\ |    ___/\\__ _:|: __   \\ :      \\ :      \\ : __||    |___ :         |
    ********       **********************#           |   .   ||___    \\  |  :||  \\____||   .   ||       || : ||    |   ||   \\  /  |
    *       *****************************#           |   :   ||       /  |   ||   :  \\ |   :   ||   |   ||   ||    :   ||   |\\/   |
    %*****************************#                  |___|   ||__:___/   |   ||   |___\\|___|   ||___|   ||   ||        ||___| |   |
    %***********************/                            |___|   :       |___||___|        |___|    |___||___||. _____/       |___|
    %****************(       (%                                                                                :/
    %*********(       ********%                                                                                :
    %*************    ********%
    %*************************%
    **************************%
        ********************%
                **************%
    `;

	public static Channels = {
		all_members: "928446344786481282",
		members: "928446348108386384",
		bots: "928446351459618816",
		boost_level: "1059646277891145818",
		chatbot: "1010861367726710864",
		confessions: "1060066139813711954",
		counting: "1010861276404134031",
		events: "927722032303591484",
		forums: "1060062196639473674",
		self_roles: "927500382987505715",
		starboard: "927760449888477184",
		suggestions: "927703276730843216",
		qotd: "927502892682866688",
		verification: "927717827845181520",
		moderation_logs: "927759932835643443",
		server_logs: "1063031442424213554",
		member_logs: "1063031530689150996",
		message_logs: "1063031556861599855",
		reports: "1067225050832449616"
	};

	public static Colors: typeof Colors & {
		Invisible: 0x2c2d31;
	} = {
		...Colors,
		Invisible: 0x2c2d31
	};

	public static Embed = {
		colors: {
			invisible: this.Colors.Invisible,
			blurple: this.Colors.Blurple,
			default: this.Colors.Invisible
		}
	};

	public static Emojis = {
		astranium: "<:astranium:1059644588572299364>",
		clyde: "<:clyde:1061577982671593524>",
		discord_channel: "<:discord_channel:1061577984441589790>",
		discord_developer: "<:discord_developer:1061577987381788762>",
		discord_dnd: "<:discord_dnd:1061577990452035614>",
		discord_id: "<:discord_id:1061577992205258852>",
		discord_idle: "<:discord_idle:1061577995405508608>",
		discord_loading: "<a:discord_loading:1061577997343268864>",
		discord_nitro: "<:discord_nitro:1061577926975434792>",
		discord_notif: "<:discord_notif:1061577929995321395>",
		discord_offline: "<:discord_offline:1061577931857592380>",
		discord_online: "<:discord_online:1061577934751682741>",
		discord_presence: "<:discord_presence:1061577936513290331>",
		discord_reply: "<:discord_reply:1061578776259076136>",
		discord_tag: "<:discord_tag:1061577939554140200>",
		discord_tree: "<:discord_tree:1061577941626130455>",
		discord_update_thread: "<:discord_update_thread:1061577945187106857>",
		discord_user: "<:discord_user:1061577948261535744>",
		discord_volume: "<:discord_volume:1061577949968601089>",
		green_check_mark: "✅",
		loading_bar: "<a:loading_bar:1061577886693330954>",
		network_bars: "<:network_bars:1061577889230893057>",
		star: "⭐",
		white_chat: "<:white_chat:1061577843022254090>",
		white_check_mark: "<:white_check_mark:1061577846025367613>",
		white_cross: "<:white_cross:1064408280119656510>",
		white_external_url: "<:white_external_url:1061577848063807588>",
		white_file: "<:white_file:1061577851415052319>",
		white_globe: "<:white_globe:1061577854413983824>",
		white_link: "<:white_link:1061577856318197780>",
		white_new_user: "<:white_new_user:1061577860441194526>",
		white_pencil: "<:white_pencil:1061577793789497406>",
		white_settings: "<:white_settings:1061577796985552947>",
		white_star: "<:white_star:1061577798814281758>",
		white_stats: "<:white_stats:1061577801687379998>",
		white_thumbs_down: "<:white_thumbs_down:1061577803478343721>",
		white_thumbs_up: "<:white_thumbs_up:1061577806628270181>",
		white_timer: "<:white_timer:1061577808599593010>"
	};

	public static ProcessExitCodes = {
		0: "success",
		1: "uncaught fatal exception",
		2: "bash error",
		3: "internal JavaScript parse error",
		4: "internal javascript evaluation failure",
		5: "fatal error",
		6: "non-function internal exception handler",
		7: "internal exception handler run-time failure",
		8: "uncaught exception (deprecated)",
		9: "invalid argument",
		10: "internal JavaScript run-time failure",
		12: "invalid debug argument"
	};

	public static ReactionMessages = {
		verification: "1085773581281136670",
		pronouns: "1093490025838161951",
		gender: "1093490029747245147",
		age: "1093490034138677278",
		location: "1093490037427015721",
		pings: "1093490041520656394"
	};

	public static ReactionRoles = {
		// Pronouns roles
		"he/him": {
			role: "927804994558771290",
			reaction: "1️⃣",
			messageID: Constants.ReactionMessages["pronouns"]
		},
		"he/they": {
			role: "1071926106648748132",
			reaction: "2️⃣",
			messageID: Constants.ReactionMessages["pronouns"]
		},
		"she/her": {
			role: "927804777826484244",
			reaction: "3️⃣",
			messageID: Constants.ReactionMessages["pronouns"]
		},
		"she/they": {
			role: "1071926332478460004",
			reaction: "4️⃣",
			messageID: Constants.ReactionMessages["pronouns"]
		},
		"they/them": {
			role: "927805038552821800",
			reaction: "5️⃣",
			messageID: Constants.ReactionMessages["pronouns"]
		},
		"any_pronouns": {
			role: "927805082219724810",
			reaction: "6️⃣",
			messageID: Constants.ReactionMessages["pronouns"]
		},
		// Gender roles
		"male": {
			role: "1071928543765864499",
			reaction: "♂️",
			messageID: Constants.ReactionMessages["gender"]
		},
		"female": {
			role: "1071928574514298911",
			reaction: "♀️",
			messageID: Constants.ReactionMessages["gender"]
		},
		"non_binary": {
			role: "1071928603740217435",
			reaction: "⚪",
			messageID: Constants.ReactionMessages["gender"]
		},
		"other_gender": {
			role: "1071928631628148917",
			reaction: "🔵",
			messageID: Constants.ReactionMessages["gender"]
		},
		// Age roles
		"13-15": {
			role: "927805115606401055",
			reaction: "1️⃣",
			messageID: Constants.ReactionMessages["age"]
		},
		"16-19": {
			role: "927805159768227910",
			reaction: "2️⃣",
			messageID: Constants.ReactionMessages["age"]
		},
		"20+": {
			role: "927805196845858846",
			reaction: "3️⃣",
			messageID: Constants.ReactionMessages["age"]
		},
		// Region roles
		"north_america": {
			role: "927805235789963355",
			reaction: "1️⃣",
			messageID: Constants.ReactionMessages["location"]
		},
		"south_america": {
			role: "927805260343427122",
			reaction: "2️⃣",
			messageID: Constants.ReactionMessages["location"]
		},
		"europe": {
			role: "927805278475415582",
			reaction: "3️⃣",
			messageID: Constants.ReactionMessages["location"]
		},
		"asia": {
			role: "927805294627667978",
			reaction: "4️⃣",
			messageID: Constants.ReactionMessages["location"]
		},
		"oceania": {
			role: "927805314961637376",
			reaction: "5️⃣",
			messageID: Constants.ReactionMessages["location"]
		},
		"africa": {
			role: "1085758231726538752",
			reaction: "6️⃣",
			messageID: Constants.ReactionMessages["location"]
		},
		// Ping roles
		"announcement_ping": {
			role: "927823328847216650",
			reaction: "1️⃣",
			messageID: Constants.ReactionMessages["pings"]
		},
		"event_ping": {
			role: "927823396773982230",
			reaction: "2️⃣",
			messageID: Constants.ReactionMessages["pings"]
		},
		"giveaway_ping": {
			role: "927823425647546388",
			reaction: "3️⃣",
			messageID: Constants.ReactionMessages["pings"]
		},
		"qotd_ping": {
			role: "927823456349847582",
			reaction: "4️⃣",
			messageID: Constants.ReactionMessages["pings"]
		},
		"poll_ping": {
			role: "927823486477557780",
			reaction: "5️⃣",
			messageID: Constants.ReactionMessages["pings"]
		}
	};

	public static Roles = {
		// Title roles
		"staff": "1060496582904131595",
		"level": "1060069342735245372",
		"roles": "927821116951650334",
		"about": "927805534600585218",
		"pings": "927823246525599795",
		// Member roles
		"giveawayWinner": "927756560644583474",
		"member": "927725674049978398",
		// Level roles
		"overlord": "927756486367666207",
		"supreme": "927756402888409109",
		"legendary": "927756332424105985",
		"ascension": "927756240543694951",
		"dedicated": "927756139058315294",
		"regular": "927755968840863744",
		"active": "927756054673121280",
		// Pronouns roles
		"he/him": "927804994558771290",
		"he/they": "1071926106648748132",
		"she/her": "927804777826484244",
		"she/they": "1071926332478460004",
		"they/them": "927805038552821800",
		"any_pronouns": "927805082219724810",
		// Gender roles
		"male": "1071928543765864499",
		"female": "1071928574514298911",
		"non_binary": "1071928603740217435",
		"other_gender": "1071928631628148917",
		// Age roles
		"13-15": "927805115606401055",
		"16-19": "927805159768227910",
		"20+": "927805196845858846",
		// Region roles
		"north_america": "927805235789963355",
		"south_america": "927805260343427122",
		"europe": "927805278475415582",
		"asia": "927805294627667978",
		"oceania": "927805314961637376",
		// Ping roles
		"announcement_ping": "927823328847216650",
		"event_ping": "927823396773982230",
		"giveaway_ping": "927823425647546388",
		"qotd_ping": "927823456349847582",
		"poll_ping": "927823486477557780",
		// Other
		"bot": "927727427713658922"
	};

	public static LevelRoles = {
		"5": this.Roles["active"],
		"15": this.Roles["regular"],
		"25": this.Roles["dedicated"],
		"40": this.Roles["ascension"],
		"60": this.Roles["legendary"],
		"80": this.Roles["supreme"],
		"100": this.Roles["overlord"]
	};

	public static UserFlags = {
		ActiveDeveloper: `${this.Emojis["active_developer"]} Active Developer`,
		CertifiedModerator: `${this.Emojis["certified_moderator"]} Certified Moderator`,
		HypeSquadOnlineHouse1: `${this.Emojis["hypesquad_bravery"]} HypeSquad Bravery`,
		HypeSquadOnlineHouse2: `${this.Emojis["hypesquad_brilliance"]} HypeSquad Brilliance`,
		HypeSquadOnlineHouse3: `${this.Emojis["hypesquad_balance"]} HypeSquad Balance`,
		Hypesquad: `${this.Emojis["hypesquad"]} HypeSquad Events`,
		Partner: `${this.Emojis["partner"]} Partnered Server Owner`,
		PremiumEarlySupporter: `${this.Emojis["early_supporter"]} Early Nitro Supporter`,
		Staff: `${this.Emojis["discord_employee"]} Discord Employee`,
		VerifiedDeveloper: `${this.Emojis["verified_developer"]} Early Verified Bot Developer`
	};

	public static Users = {
		qotd_bot: "713586207119900693"
	};

	public static Webhooks = {
		events: new WebhookClient({
			url: process.env.EVENTS_WEBHOOK
		})
	};
}
