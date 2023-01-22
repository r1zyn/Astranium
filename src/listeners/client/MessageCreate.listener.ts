import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type { Message } from "discord.js";
import { Listener } from "@lib/Listener";

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
			await client.util.xp(message);
		}
	}
}
