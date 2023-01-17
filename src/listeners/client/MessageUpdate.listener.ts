import { AstraniumClient } from "../../lib/Client";
import { Attachment, EmbedBuilder, Message, TextChannel } from "discord.js";
import { Constants } from "../../constants";
import { Listener } from "../../lib/Listener";
import { Star } from "@prisma/client";

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

        if (newMessage.guild) {
            const starReactions: number =
                newMessage.reactions.cache.get(Constants.Emojis["star"])
                    ?.count || 0;

            if (starReactions >= 3) {
                const starboard: TextChannel | null =
                    await client.util.fetchChannel(
                        Constants.Channels["starboard"],
                        newMessage.guild
                    );
                const attachment: Attachment | undefined =
                    newMessage.attachments.first();

                if (!starboard) return;
                if (newMessage.channel.id === Constants.Channels["starboard"]) {
                    return;
                }

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

                const starMessage: Message<true> =
                    await starboard.messages.fetch(star.starId);
                starMessage.editable &&
                    starMessage.edit({
                        embeds: [embed]
                    });
            }
        }
    }
}
