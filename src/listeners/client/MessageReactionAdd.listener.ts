import type { AstraniumClient } from "@lib/Client";
import type {
	Attachment,
	EmbedBuilder,
	Message,
	MessageReaction,
	TextChannel,
	User
} from "discord.js";
import { Constants } from "@core/constants";
import { Listener } from "@lib/Listener";
import type { Star } from "@prisma/client";

export default class MessageReactionAddListener extends Listener {
	public constructor() {
		super("messageReactionAdd", {
			category: "client",
			emitter: "client",
			once: false
		});
	}

	public async exec(
		client: AstraniumClient,
		reaction: MessageReaction,
		user: User
	): Promise<void> {
		if (reaction.partial) await reaction.fetch();

		if (
			reaction.emoji.name === Constants.Emojis["green_check_mark"] &&
			reaction.message.id === Constants.ReactionMessages["verification"]
		) {
			await client.util.verifyMember(reaction, user);
		}

		if (reaction.message.guild && reaction.message.author) {
			if (reaction.emoji.name === Constants.Emojis["star"]) {
				const starboard: TextChannel | null =
					await client.util.fetchChannel(
						Constants.Channels["starboard"],
						reaction.message.guild
					);
				const attachment: Attachment | undefined =
					reaction.message.attachments.first();

				if (!starboard) return;
				if (
					reaction.message.channel.id ===
					Constants.Channels["starboard"]
				) {
					return;
				}

				const embed: EmbedBuilder = client.util
					.embed({
						author: {
							name: reaction.message.author.tag,
							iconURL: reaction.message.author.displayAvatarURL()
						},
						timestamp: reaction.message.createdAt
					})
					.setColor("Yellow");

				if (reaction.message.content) {
					embed.setDescription(
						`${
							reaction.message.content
						}\n\n${client.formatter.hyperlink(
							"**Jump to message**",
							reaction.message.url
						)}`
					);
					if (attachment) embed.setImage(attachment.url);
				}

				if (attachment && !reaction.message.content) {
					embed
						.setDescription(
							`\n\n${client.formatter.hyperlink(
								"**Jump to message**",
								reaction.message.url
							)}`
						)
						.setImage(attachment.url);
				}

				const star: Star | null = await client.db.star.findUnique({
					where: { messageId: reaction.message.id }
				});

				await reaction.message.fetch();
				const starReactions: number =
					reaction.message.reactions.cache.get(
						Constants.Emojis["star"]
					)?.count || 0;

				if (starReactions === 3 && !star) {
					const starredMessage: Message<true> = await starboard.send({
						content: `:star: **${starReactions} |** ${reaction.message.channel}`,
						embeds: [embed]
					});

					await client.db.star.create({
						data: {
							messageId: reaction.message.id,
							starId: starredMessage.id
						}
					});
				} else if (starReactions >= 3 && star) {
					const starredMessage: Message<true> =
						await starboard.messages.fetch(star.starId);

					starredMessage.edit({
						content: `:star: **${starReactions} |** ${reaction.message.channel}`
					});
				}
			}
		}
	}
}
