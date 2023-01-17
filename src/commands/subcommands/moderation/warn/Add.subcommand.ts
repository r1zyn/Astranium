import {
    ApplicationCommandOptionType,
    DMChannel,
    EmbedBuilder,
    GuildMember,
    Message,
    TextChannel
} from "discord.js";
import type { AstraniumClient } from "../../../../lib/Client";
import { CaseType } from "../../../../enums";
import { Constants } from "../../../../constants";
import type { ModerationCase } from "@prisma/client";
import type { SlashCommandInteraction } from "../../../../types";
import { SubCommand } from "../../../../lib/SubCommand";

export default class AddSubCommand extends SubCommand {
    public constructor() {
        super("add", {
            args: [
                {
                    name: "member",
                    description: "The member to warn.",
                    required: true,
                    type: ApplicationCommandOptionType.User
                },
                {
                    name: "reason",
                    description: "The reason for warning the member.",
                    required: false,
                    type: ApplicationCommandOptionType.String
                }
            ],
            description: "Warns a server member."
        });
    }

    public async exec(
        client: AstraniumClient,
        interaction: SlashCommandInteraction<"cached">
    ): Promise<void | Message<boolean>> {
        const moderationLogs: TextChannel | null =
            await client.util.fetchChannel<TextChannel>(
                Constants.Channels["moderation_logs"],
                interaction.guild
            );
        const member: GuildMember = await interaction.guild.members.fetch(
            interaction.options.getUser("member", true)
        );
        const reason: string | null = interaction.options.getString("reason");
        const caseNumber: number =
            (
                await client.db.moderationCase.findMany({
                    where: { memberId: member.id }
                })
            ).length + 1 ?? 1;
        const warnNumber: number =
            (
                await client.db.moderationCase.findMany({
                    where: { memberId: member.id, type: CaseType.WARN }
                })
            ).length + 1 ?? 1;
        let caseId: string = client.util.generateKey(18);

        if (member.user.bot) {
            return client.util.warn(interaction, {
                message: "The specified member to warn cannot be a bot user."
            });
        }

        if (
            interaction.member.roles.highest.comparePositionTo(
                member.roles.highest
            ) <= 0
        ) {
            return client.util.warn(interaction, {
                message:
                    "You cannot warn the member as they have either higher or similiar roles."
            });
        }

        while (
            await client.db.moderationCase.findUnique({ where: { caseId } })
        ) {
            caseId = client.util.generateKey(18);
        }

        await client.db.moderationCase
            .create({
                data: {
                    caseId,
                    memberId: member.id,
                    moderatorId: interaction.member.id,
                    reason: reason ?? undefined,
                    type: CaseType.WARN
                }
            })
            .then(async (moderationCase: ModerationCase): Promise<void> => {
                const memberEmbed: EmbedBuilder = client.util.embed({
                    author: {
                        name: `${interaction.guild.name} - Server Warn (Case ID ${caseId})`,
                        iconURL: interaction.guild.iconURL() ?? undefined
                    },
                    description: `You were warned in ${
                        interaction.guild.name
                    } at ${client.formatter.time(
                        moderationCase.date
                    )}. This is your **${caseNumber}${client.formatter.suffix(
                        caseNumber
                    )}** moderation case and **${warnNumber}${client.formatter.suffix(
                        warnNumber
                    )}** server warn.`,
                    fields: [
                        {
                            name: "Responsible Moderator",
                            value: interaction.member.toString(),
                            inline: true
                        },
                        {
                            name: "Warn Reason",
                            value: moderationCase.reason,
                            inline: true
                        }
                    ]
                });

                const loggingEmbed: EmbedBuilder = client.util.embed({
                    author: {
                        name: `${member.user.tag} - Server Warn (Case ID ${caseId})`,
                        iconURL: member.user.displayAvatarURL()
                    },
                    description: `${member} was warned at ${client.formatter.time(
                        moderationCase.date
                    )}. This is their **${caseNumber}${client.formatter.suffix(
                        caseNumber
                    )}** moderation case and **${warnNumber}${client.formatter.suffix(
                        warnNumber
                    )}** server warn.`,
                    fields: [
                        {
                            name: "Responsible Moderator",
                            value: interaction.member.toString(),
                            inline: true
                        },
                        {
                            name: "Warn Reason",
                            value: moderationCase.reason,
                            inline: true
                        }
                    ]
                });

                let isDMable: boolean = true;

                if (!member.dmChannel) {
                    await member
                        .createDM()
                        .then(
                            async (dm: DMChannel): Promise<Message<false>> => {
                                return await dm.send({
                                    embeds: [memberEmbed]
                                });
                            }
                        )
                        .catch((): boolean => (isDMable = false));
                } else {
                    await member.dmChannel.send({
                        embeds: [memberEmbed]
                    });

                    if (moderationLogs) {
                        await moderationLogs.send({
                            embeds: [loggingEmbed]
                        });
                    }
                }

                await interaction.reply({
                    embeds: [
                        client.util.embed({
                            description: `${
                                Constants.Emojis.white_check_mark
                            } Successfully warned ${member} (**ID:** ${
                                moderationCase.caseId
                            }) ${
                                !isDMable ? "User was unable to be DMed." : ""
                            }`
                        })
                    ],
                    ephemeral: true
                });
            });
    }
}
