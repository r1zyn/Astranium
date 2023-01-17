import {
    ApplicationCommandOptionType,
    Collection,
    GuildBasedChannel,
    GuildTextBasedChannel,
    Message,
    PartialMessage
} from "discord.js";
import { Constants } from "../../constants";
import type { AstraniumClient } from "../../lib/Client";
import { Command } from "../../lib/Command";
import { SlashCommandInteraction } from "../../types";

export default class ClearCommand extends Command {
    public constructor() {
        super("clear", {
            aliases: ["purge"],
            args: [
                {
                    name: "amount",
                    description:
                        "The amount of messages to delete in the channel.",
                    required: true,
                    type: ApplicationCommandOptionType.Number,
                    minValue: 1,
                    maxValue: 100
                },
                {
                    name: "channel",
                    description: "The channel to delete the messages in.",
                    required: false,
                    type: ApplicationCommandOptionType.Channel
                }
            ],
            category: "Moderation",
            description:
                "Bulk deletes a certain amount of messages in a channel.",
            examples: ["clear 20", "purge 100 #general"],
            ownerOnly: false,
            permissions: {
                user: ["ManageMessages"]
            },
            usage: "clear <amount> [channel]"
        });
    }

    public async exec(
        client: AstraniumClient,
        interaction: SlashCommandInteraction<"cached">
    ): Promise<void> {
        const amount: number = interaction.options.getNumber("amount", true);
        const channel: GuildBasedChannel =
            interaction.options.getChannel("channel") ??
            (interaction.channel as GuildTextBasedChannel);

        if (!channel.isTextBased()) {
            return client.util.warn(interaction, {
                message: "The provided channel must be a text based channel."
            });
        }

        // Note: figure out what the filterOld param does
        await channel
            .bulkDelete(await channel.messages.fetch(), true)
            .then(
                async (
                    messages: Collection<
                        string,
                        Message<boolean> | PartialMessage | undefined
                    >
                ) => {
                    await interaction.reply({
                        embeds: [
                            client.util.embed({
                                description: `${Constants.Emojis["white_check_mark"]} Successfully bulk deleted ${messages.size} messages in ${channel}`
                            })
                        ]
                    }); // Note: add logging
                }
            );
    }
}
