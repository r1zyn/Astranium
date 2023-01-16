import { AstraniumClient } from "../../lib/Client";
import { Constants } from "../../constants";
import { Message, MessageReaction, TextChannel, User } from "discord.js";
import { Listener } from "../../lib/Listener";
import { Star } from "@prisma/client";

export default class MessageReactionRemoveListener extends Listener {
    public constructor() {
        super("messageReactionRemove", {
            category: "client",
            emitter: "client",
            once: false
        });
    }

    public async exec(
        client: AstraniumClient,
        reaction: MessageReaction,
        _user: User
    ): Promise<void> {
        if (reaction.partial) await reaction.fetch();

        if (reaction.message.guild && reaction.message.author) {
            if (reaction.message.channel.id === Constants.Channels["starboard"]) { return; }

            if (reaction.emoji.name === Constants.Emojis["star"]) {
                const starboard: TextChannel | null =
                    await client.util.fetchChannel(
                        Constants.Channels["starboard"],
                        reaction.message.guild
                    );

                const star: Star | null = await client.db.star.findUnique({
                    where: { messageId: reaction.message.id }
                });

                await reaction.message.fetch();
                const starReactions: number =
                    reaction.message.reactions.cache.get(
                        Constants.Emojis["star"]
                    )?.count || 0;

                if (!starboard) return;

                if (star) {
                    const starredMessage: Message<true> =
                        await starboard.messages.fetch(star.starId);

                    if (starReactions < 3) {
                        await client.db.star
                            .delete({
                                where: { messageId: reaction.message.id }
                            })
                            .then(
                                (): Promise<Message<true>> =>
                                    starredMessage.delete()
                            );
                    } else if (starReactions >= 3) {
                        starredMessage.edit({
                            content: `:star: **${starReactions} |** ${reaction.message.channel}`
                        });
                    }
                }
            }
        }
    }
}
