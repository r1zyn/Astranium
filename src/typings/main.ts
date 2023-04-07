import type {
	CacheType,
	ChatInputCommandInteraction,
	FetchMemberOptions,
	FetchMembersOptions,
	GuildMember,
	GuildTextBasedChannel,
	TextBasedChannel,
	User,
	UserResolvable
} from "discord.js";

export interface AstraniumEvents {
	memberLevelUp: [channel: GuildTextBasedChannel | null, member: GuildMember];
}

export type ClientPlatform = "Desktop" | "Mobile" | "Browser";

export interface EditSnipe {
	content: EditSnipeContent;
	author: User;
	channel: TextBasedChannel;
	image: EditSnipeImage;
	time: EditSnipeTime;
	url: string | null;
}

export interface EditSnipeContent {
	before: string;
	after: string;
}

export interface EditSnipeImage {
	before: string | null;
	after: string | null;
}

export interface EditSnipeTime {
	before: string;
	after: string;
}

export interface ErrorOptions {
	emitter: string;
	ephemeral?: boolean;
	error: Error | string;
	kill?: boolean;
	method?: "reply" | "send";
}

export type GenericFunction<T = any> = (...args: any[]) => Promise<T>;

export type MemberAcknowledgements =
	| "None"
	| "Server Owner"
	| "Administrator"
	| "Staff Member"
	| "Server Booster";

export type MemberFetchOptions =
	| UserResolvable
	| FetchMemberOptions
	| (FetchMembersOptions & {
			user: UserResolvable;
	  });

export interface MessageSelectMenuOption {
	label: string;
	description: string;
	value: string;
}

export interface SetXpOptions {
	xp: number;
	member: GuildMember;
	channel?: GuildTextBasedChannel;
}

export type SlashCommandInteraction<T extends CacheType = CacheType> =
	ChatInputCommandInteraction<T>;

export interface Snipe {
	content: string;
	author: User;
	channel: TextBasedChannel;
	image: string | null;
	time: string;
}

export interface WarnOptions {
	ephemeral?: boolean;
	message: string;
	method?: "reply" | "send";
}
