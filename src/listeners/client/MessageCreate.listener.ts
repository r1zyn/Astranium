import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type { Message } from "discord.js";
import { Listener } from "@lib/Listener";
import type { Member, Prisma } from "@prisma/client";

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

			if (!message.member) return;

			const where: Prisma.MemberWhereUniqueInput = {
				id: message.member.id
			};

			const member: Member | null = await global.prisma.member.findUnique(
				{ where }
			);
			if (!member) return;

			const availableXp: number[] = Array.from(
				{ length: 10 },
				(_: unknown, i: number): number => i + 1
			);
			const givenXp: number =
				availableXp[Math.floor(Math.random() * availableXp.length)];
			const pendingXp: number = member.xp + givenXp;

			await global.prisma.member.update({
				where,
				data: {
					xp: pendingXp
				}
			});

			const pendingLevel: number = Math.floor(0.1 * Math.sqrt(pendingXp));
			const currentLevel: number = member.level;

			// Note: add xp cooldown

			if (pendingLevel > currentLevel) {
				client.emit(
					"memberLevelUp",
					message,
					message.member,
					pendingLevel
				);
			}
		}
	}
}
