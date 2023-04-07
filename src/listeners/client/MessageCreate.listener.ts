import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type { Message } from "discord.js";
import { Listener } from "@lib/Listener";
// import type { Member } from "@prisma/client";

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
		if (
			!message.guild ||
			!message.inGuild() ||
			!message.channel.isTextBased()
		) {
			return;
		}

		await handleChatBot(client, message);
		await handleQotd(client, message);
		// await handleXp(client, message);
	}
}

async function handleChatBot(
	client: AstraniumClient,
	message: Message<true>
): Promise<void> {
	if (message.channelId === Constants.Channels["chatbot"]) {
		await client.util.chatbot(message);
	}
}

async function handleQotd(
	client: AstraniumClient,
	message: Message<true>
): Promise<void> {
	if (
		message.channelId === Constants.Channels["qotd"] &&
		message.author.id === Constants.Users["qotd_bot"]
	) {
		await message.reply({
			content: client.formatter.roleMention(Constants.Roles["qotd_ping"])
		});
	}
}

// async function handleXp(
// 	client: AstraniumClient,
// 	message: Message<true>
// ): Promise<void> {
// 	if (message.member) {
// 		const member: Member = await client.util.syncMember(message.member);
// 		const availableXp: number[] = Array.from(
// 			{ length: 10 },
// 			(_: unknown, i: number): number => i + 1
// 		);
// 		const givenXp: number =
// 			availableXp[Math.floor(Math.random() * availableXp.length)];
// 		const pendingXp: number = member.xp + givenXp;

// 		await client.util.setXp(client, {
// 			xp: pendingXp,
// 			member: message.member,
// 			channel: message.channel
// 		});
// 	}
// }
