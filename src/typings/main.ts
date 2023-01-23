import type {
	CacheType,
	ChatInputCommandInteraction,
	FetchMemberOptions,
	FetchMembersOptions,
	GuildMember,
	GuildTextBasedChannel,
	Message,
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

export interface ErrorOptions {
	emitter: string;
	ephemeral?: boolean;
	error: Error | string;
	kill?: boolean;
	method?: "reply" | "send";
}

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

export interface WarnOptions {
	ephemeral?: boolean;
	message: string;
	method?: "reply" | "send";
}
