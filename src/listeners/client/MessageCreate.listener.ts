import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type { Message } from "discord.js";
import { Listener } from "@lib/Listener";
import type { Member } from "@prisma/client";

export default class MessageCreateListener extends Listener {
	public constructor() {
		super("messageCreate", {
			category: "client",
			emitter: "client",
			once: false
		});
	}

	public async exec(
		client: AstraniumClient,
		message: Message
	): Promise<void> {
		if (message.partial) await message.fetch();
		if (message.author.bot) return;

		if (message.guild) {
			if (message.channelId === Constants.Channels["chatbot"]) {
				await client.util.chatbot(message);
			}

			if (!message.member) return;
			await client.util.syncMember(message.member);

			const member: Member | null = await client.db.member.findUnique({
				where: { id: message.member.id }
			});
			if (!member) return;

			const xp: number = Math.floor(Math.random() * 12 + 12);

			if (xp >= member.level * 250) {
				await client.db.member
					.update({
						where: { id: message.member.id },
						data: {
							level: member.level + 1,
							xp: 0
						}
					})
					.then(async (member: Member): Promise<void> => {
						await message.channel.send({
							embeds: [
								client.util.embed({
									description: `${message.member} has reached level **${member.level}**!`
								})
							]
						});
					});
			} else {
				await client.db.member.update({
					where: { id: message.member.id },
					data: {
						xp: member.xp + xp
					}
				});
			}

			client.xpCooldowns.add(message.author.id);
			setTimeout(
				(): boolean => client.xpCooldowns.delete(message.author.id),
				60 * 1000
			);
		}
	}
}
