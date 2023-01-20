import type { AstraniumClient } from "../../lib/Client";
import type { GuildMember } from "discord.js";
import { Listener } from "../../lib/Listener";

export default class GuildMemberUpdateListener extends Listener {
	public constructor() {
		super("guildMemberUpdate", {
			category: "client",
			emitter: "client",
			once: false
		});
	}

	public async exec(
		client: AstraniumClient,
		oldMember: GuildMember,
		newMember: GuildMember
	): Promise<void> {
		if (oldMember.partial) await oldMember.fetch();
		if (newMember.partial) await newMember.fetch();

		if (oldMember.premiumSince !== newMember.premiumSince) {
			await client.util.syncStats(newMember.guild);
		}
	}
}
