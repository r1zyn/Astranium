import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type {
	GuildMember,
	Message,
	MessageReaction,
	TextChannel
} from "discord.js";
import { Listener } from "@lib/Listener";

export default class GuildMemberRemoveListener extends Listener {
	public constructor() {
		super("guildMemberRemove", {
			category: "client",
			emitter: "client",
			once: false
		});
	}

	public async exec(
		client: AstraniumClient,
		member: GuildMember
	): Promise<void> {
		if (member.partial) await member.fetch();

		await client.util.syncStats(member.guild);

		const verification: TextChannel =
			(await client.util.fetchChannel<TextChannel>(
				Constants.Channels["verification"],
				member.guild
			)) as TextChannel;
		const verificationMessage: Message<true> =
			await verification.messages.fetch(
				Constants.ReactionMessages["verification"]
			);
		const reactions: MessageReaction | undefined =
			verificationMessage.reactions.cache.get(
				Constants.Emojis["green_check_mark"]
			);

		if (reactions) {
			reactions.users.remove(member.user);
		}
	}
}
