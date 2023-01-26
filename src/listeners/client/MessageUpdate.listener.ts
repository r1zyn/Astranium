import type { AstraniumClient } from "@lib/Client";
import { Attachment, EmbedBuilder, Message, TextChannel } from "discord.js";
import { Constants } from "@core/constants";
import type { EditSnipe } from "@typings/main";
import { Listener } from "@lib/Listener";
import type { Star } from "@prisma/client";

export default class MessageUpdateListener extends Listener {
	public constructor() {
		super("messageUpdate", {
			category: "client",
			emitter: "client",
			once: false
		});
	}

	public async exec(
		client: AstraniumClient,
		oldMessage: Message,
		newMessage: Message
	): Promise<void> {
		if (oldMessage.partial) await oldMessage.fetch();
		if (newMessage.partial) await newMessage.fetch();

		await handleStarboard(client, {
			oldMessage,
			newMessage
		});

		await handleEditSnipe(client, {
			oldMessage,
			newMessage
		});
	}
}

export async function handleEditSnipe(
	client: AstraniumClient,
	{
		oldMessage,
		newMessage
	}: {
		oldMessage: Message;
		newMessage: Message;
	}
): Promise<void> {
	if (!oldMessage.guild || !newMessage.guild) return;
	if (oldMessage.embeds.length > 0 || newMessage.embeds.length > 0) return;
	if (!newMessage.editedAt) return;
	if (!client.editSnipes.get(oldMessage.channelId)) {
		client.editSnipes.set(oldMessage.channelId, []);
	}

	const messageLogs: TextChannel =
		await client.util.fetchChannel<TextChannel>(
			Constants.Channels["message_logs"],
			newMessage.guild
		);
	const editSnipes: EditSnipe[] = client.editSnipes.get(
		oldMessage.channelId
	) as EditSnipe[];

	const data: EditSnipe = {
		content: {
			before: oldMessage.content,
			after: newMessage.content
		},
		author: newMessage.author,
		channel: newMessage.channel,
		image: {
			before: oldMessage.attachments.first()
				? (oldMessage.attachments.first() as Attachment).proxyURL
				: null,
			after: newMessage.attachments.first()
				? (newMessage.attachments.first() as Attachment).proxyURL
				: null
		},
		time: {
			before: client.formatter.time(oldMessage.createdAt, "T"),
			after: client.formatter.time(newMessage.editedAt, "T")
		},
		url: newMessage.url ? newMessage.url : null
	};

	editSnipes.push(data);
	client.editSnipes.set(oldMessage.channelId, editSnipes);

	setTimeout((): void => {
		client.editSnipes.set(
			oldMessage.channelId,
			editSnipes.filter((e: EditSnipe): boolean => e !== data)
		);
	}, 300000);

	const embed: EmbedBuilder = client.util.embed({
		author: {
			name: `Recently edited message by ${oldMessage.author.tag}`,
			iconURL: oldMessage.author.displayAvatarURL()
		},
		description: `${oldMessage.author} recently edited a message in ${
			oldMessage.channel
		} at ${client.formatter.time(newMessage.editedAt, "T")}. ${
			newMessage.url
				? `Click ${client.formatter.hyperlink(
						"here",
						newMessage.url
				  )} to jump to the edited message.`
				: ""
		}\n\n**Before:** ${oldMessage.content}\n**After:** ${
			newMessage.content
		}`
	});

	if (oldMessage.attachments.first()) {
		embed.setImage((oldMessage.attachments.first() as Attachment).proxyURL);
	}

	if (newMessage.attachments.first()) {
		embed.setImage((newMessage.attachments.first() as Attachment).proxyURL);
	}

	await messageLogs.send({
		embeds: [embed]
	});

	if (oldMessage.mentions.repliedUser || newMessage.mentions.repliedUser) {
		return;
	}

	if (
		(oldMessage.mentions.members ||
			oldMessage.mentions.roles ||
			oldMessage.mentions.everyone) &&
		!newMessage.mentions.members &&
		!newMessage.mentions.roles &&
		!newMessage.mentions.everyone
	) {
		oldMessage.reply({
			embeds: [
				client.util.embed({
					author: {
						name: `Ghost ping detected from ${oldMessage.author.tag} (edited message)`,
						iconURL: oldMessage.author.displayAvatarURL()
					},
					description: `${
						oldMessage.author
					} recently ghost pinged in ${
						oldMessage.channel
					} at ${client.formatter.time(new Date(), "T")}.\n\n> ${
						oldMessage.content
					}`
				})
			]
		});

		messageLogs.send({
			embeds: [
				client.util.embed({
					color: Constants["Defaults"].embed.color.default,
					author: {
						name: `Ghost ping detected from ${oldMessage.author.tag} (edited message)`,
						iconURL: oldMessage.author.displayAvatarURL()
					},
					description: `${
						oldMessage.author
					} recently ghost pinged in ${
						oldMessage.channel
					} at ${client.formatter.time(new Date(), "T")}. ${
						newMessage.url
							? `Click ${client.formatter.hyperlink(
									"here",
									newMessage.url
							  )} to jump to the edited message.`
							: ""
					}\n\n> ${oldMessage.content}`
				})
			]
		});
	}
}

export async function handleStarboard(
	client: AstraniumClient,
	{
		oldMessage,
		newMessage
	}: {
		oldMessage: Message;
		newMessage: Message;
	}
): Promise<void> {
	if (!oldMessage.guild || !newMessage.guild) return;

	const starReactions: number =
		newMessage.reactions.cache.get(Constants.Emojis["star"])?.count || 0;

	if (starReactions >= 3) {
		const starboard: TextChannel =
			await client.util.fetchChannel<TextChannel>(
				Constants.Channels["starboard"],
				newMessage.guild
			);
		const attachment: Attachment | undefined =
			newMessage.attachments.first();

		if (!starboard) return;
		if (newMessage.channel.id === Constants.Channels["starboard"]) return;

		const embed: EmbedBuilder = client.util
			.embed({
				author: {
					name: newMessage.author.tag,
					iconURL: newMessage.author.displayAvatarURL()
				},
				timestamp: newMessage.createdAt
			})
			.setColor("Yellow");

		if (newMessage.content) {
			embed.setDescription(
				`${newMessage.content}\n\n${client.formatter.hyperlink(
					"**Jump to message**",
					newMessage.url
				)}`
			);
			if (attachment) embed.setImage(attachment.url);
		}

		if (attachment && !newMessage.content) {
			embed
				.setDescription(
					`\n\n${client.formatter.hyperlink(
						"**Jump to message**",
						newMessage.url
					)}`
				)
				.setImage(attachment.url);
		}

		const star: Star | null = await client.db.star.findUnique({
			where: { messageId: newMessage.id }
		});
		if (!star) return;

		const starMessage: Message<true> = await starboard.messages.fetch(
			star.starId
		);
		starMessage.editable &&
			starMessage.edit({
				embeds: [embed]
			});
	}
}
