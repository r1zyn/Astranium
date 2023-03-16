import type { AstraniumClient } from "@lib/Client";
import type {
	Attachment,
	EmbedBuilder,
	Message,
	TextChannel
} from "discord.js";
import { Constants } from "@core/constants";
import { Listener } from "@lib/Listener";
import type { Snipe } from "@typings/main";

export default class MessageDeleteListener extends Listener {
	public constructor() {
		super("messageDelete", {
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

		await handleSnipe(client, message);
	}
}

async function handleSnipe(
	client: AstraniumClient,
	message: Message
): Promise<void> {
	if (!message.guild) return;
	if (message.author.bot) return;
	if (message.embeds.length > 0) return;
	if (!client.snipes.get(message.channelId)) {
		client.snipes.set(message.channelId, []);
	}

	const messageLogs: TextChannel =
		await client.util.fetchChannel<TextChannel>(
			Constants.Channels["message_logs"],
			message.guild
		);
	const snipes: Snipe[] = client.snipes.get(message.channelId) as Snipe[];
	snipes.push({
		content: message.content,
		author: message.author,
		channel: message.channel,
		image:
			message.attachments && message.attachments.first()
				? (message.attachments.first() as Attachment).proxyURL
				: null,
		time: client.formatter.time(message.createdAt, "T")
	});

	client.snipes.set(message.channelId, snipes);

	setTimeout((): void => {
		delete (client.snipes.get(message.channelId) as Snipe[])[0];
	}, 300000);

	const embed: EmbedBuilder = client.util.embed({
		author: {
			name: `Recently deleted message sent by ${message.author.tag}`,
			iconURL: message.author.displayAvatarURL()
		},
		description: `A message sent by ${
			message.author.tag
		} was recently deleted in ${message.channel} at ${client.formatter.time(
			new Date()
		)}.\n\n> ${message.content}`
	});

	if (message.attachments.first()) {
		embed.setImage((message.attachments.first() as Attachment).proxyURL);
	}

	await messageLogs.send({
		embeds: [embed]
	});

	if (
		message.mentions.members?.first() ||
		message.mentions.roles?.first() ||
		message.mentions.everyone ||
		message.mentions.repliedUser
	) {
		const ghostEmbed: EmbedBuilder = client.util.embed({
			author: {
				name: `Ghost ping detected from message by ${message.author.tag} (deleted message)`,
				iconURL: message.author.displayAvatarURL()
			},
			description: `A ghost ping was detected in a message by ${
				message.author.tag
			} in ${message.channel} at ${client.formatter.time(
				new Date()
			)}.\n\n> ${message.content}`
		});

		await message.channel.send({
			embeds: [ghostEmbed]
		});

		await messageLogs.send({
			embeds: [ghostEmbed]
		});
	}
}
