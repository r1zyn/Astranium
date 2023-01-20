import type { AstraniumClient } from "../../lib/Client";
import type { GuildMember } from "discord.js";
import { Listener } from "../../lib/Listener";

export default class GuildMemberAddListener extends Listener {
	public constructor() {
		super("guildMemberAdd", {
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
		await client.util.syncMember(member);
	}
}
