import {
    ApplicationCommandOptionType,
    ForumChannel,
    InteractionResponse,
    Message
} from "discord.js";
import type { AstraniumClient } from "../../lib/Client";
import { Command } from "../../lib/Command";
import { Constants } from "../../constants";
import type { Guild } from "@prisma/client";
import type { SlashCommandInteraction } from "../../types";

export default class ConfessCommand extends Command {
    public constructor() {
        super("confess", {
            args: [
                {
                    name: "message",
                    description: "The message to confess.",
                    required: true,
                    type: ApplicationCommandOptionType.String
                },
                {
                    name: "anonymous",
                    description:
                        "Whether or not to send the confession anonymously.",
                    required: false,
                    type: ApplicationCommandOptionType.Boolean
                }
            ],
            category: "Fun",
            description: "Sends a confession to the confession channel.",
            examples: [
                "confess message:A confession",
                "confess message:Another confession anonymous:false"
            ],
            usage: "confess <message> [anonymous]"
        });
    }

    public async exec(
        client: AstraniumClient,
        interaction: SlashCommandInteraction<"cached">
    ): Promise<
        | void
        | InteractionResponse<boolean>
        | Message<true>
        | Message<false>
        | undefined
    > {
        const confessionsChannel: ForumChannel | null =
            await client.util.fetchChannel<ForumChannel>(
                Constants.Channels["confessions"],
                interaction.guild
            );
        if (!confessionsChannel) {
            return client.util.warn(interaction, {
                message:
                    "Confessions channel was unable to be found in the server."
            });
        }

        const message: string = interaction.options.getString("message", true);
        const anonymous: boolean =
            interaction.options.getBoolean("anonymous") ?? true;

        const guild: Guild = (await client.db.guild.findUnique({
            where: { id: interaction.guild.id }
        })) as Guild;

        const confessions: number = guild.confessions;

        return await interaction
            .reply({
                embeds: [
                    client.util.embed({
                        description: `Your confession has been submitted to the ${confessionsChannel} channel.`
                    })
                ],
                ephemeral: true
            })
            .then(async (): Promise<void> => {
                await client.db.guild
                    .update({
                        where: { id: interaction.guild.id },
                        data: { confessions: confessions + 1 }
                    })
                    .then(async (g: Guild): Promise<void> => {
                        await confessionsChannel.threads.create({
                            name: anonymous
                                ? `Anonymous Confession (#${g.confessions})`
                                : `Confession by ${interaction.user.tag} (#${g.confessions})`,
                            message: {
                                embeds: [
                                    client.util
                                        .embed({
                                            title: anonymous
                                                ? `Anonymous Confession (#${g.confessions})`
                                                : `Confession by ${interaction.user.tag} (#${g.confessions})`,
                                            description: `"${message}"`,
                                            footer: {
                                                text: "Run /confess to submit a confession. If you have any issues with a confession, create a post in the forums." // Note: create report command for this
                                            },
                                            timestamp: Date.now()
                                        })
                                        .setColor("Random")
                                ]
                            }
                        });
                    });
            });
    }
}
