import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import { GuildMember, GuildTextBasedChannel } from "discord.js";
import { Listener } from "@lib/Listener";
import type { Member } from "@prisma/client";

export default class ErrorListener extends Listener {
	public constructor() {
		super("memberLevelUp", {
			category: "client",
			emitter: "client",
			once: false
		});
	}

	public async exec(
		client: AstraniumClient,
		channel: GuildTextBasedChannel | null,
		member: GuildMember
	): Promise<void> {
		if (member.user.bot) return;
		const m: Member = await client.util.syncMember(member);

		const levels: number[] = Object.keys(Constants.LevelRoles).map(
			(value: string): number => parseInt(value)
		);
		const nextLevel: number | undefined = client.util.nextLevel(
			m.level,
			levels
		);
		const rankMessage: string = levels.includes(m.level)
			? `The ${client.formatter.roleMention(
					Constants.LevelRoles[m.level.toString()]
			  )} role has been obtained.`
			: nextLevel
			? `Next role: ${client.formatter.roleMention(
					Constants.LevelRoles[nextLevel.toString()]
			  )}`
			: "The highest role has been obtained.";

		channel &&
			(await channel.send({
				embeds: [
					client.util.embed({
						description: `${member} has reached level **${m.level}**! ${rankMessage}`
					})
				]
			}));
	}
}
