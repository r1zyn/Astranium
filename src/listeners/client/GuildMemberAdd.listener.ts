import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type { GuildMember } from "discord.js";
import { Listener } from "@lib/Listener";

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

		if (!member.user.bot) {
			await client.util.syncMember(member);
		} else {
			await member.roles.add(Constants["Roles"].bot);
		}
	}
}
