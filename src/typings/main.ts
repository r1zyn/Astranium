import type {
	CacheType,
	ChatInputCommandInteraction,
	FetchMemberOptions,
	FetchMembersOptions,
	GuildMember,
	GuildTextBasedChannel,
	Message,
	TextBasedChannel,
	User,
	UserResolvable
} from "discord.js";

export interface AstraniumEvents {
	memberXpAdd: [
		interaction: SlashCommandInteraction,
		member: GuildMember,
		addedXp: number
	];
	memberXpSet: [
		interaction: SlashCommandInteraction,
		member: GuildMember,
		setXp: number
	];
	memberLevelUp: [
		channel: GuildTextBasedChannel | null,
		member: GuildMember,
		newLevel: number
	];
	memberLevelAdd: [
		message: Message,
		member: GuildMember,
		addedLevels: number
	];
	memberLevelSet: [message: Message, member: GuildMember, setLevel: number];
}

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
