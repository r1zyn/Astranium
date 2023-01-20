import type {
	CacheType,
	ChatInputCommandInteraction,
	FetchMemberOptions,
	FetchMembersOptions,
	UserResolvable
} from "discord.js";

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
