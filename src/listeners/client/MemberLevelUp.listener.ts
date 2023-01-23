import type { AstraniumClient } from "@lib/Client";
import { GuildMember, GuildTextBasedChannel, Message } from "discord.js";
import { Listener } from "@lib/Listener";

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
		member: GuildMember,
		level: number
	): Promise<void> {
		await global.prisma.member
			.update({
				where: {
					id: member.id
				},
				data: {
					level,
					xp: 0
				}
			})
			.then(async (): Promise<void> => {
				channel &&
					(await channel.send({
						embeds: [
							client.util.embed({
								description: `${member} has reached level **${level}**!`
							})
						]
					}));
			});
	}
}
