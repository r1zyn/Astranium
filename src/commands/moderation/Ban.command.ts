import {
    ApplicationCommandOptionType,
    GuildMember,
    TextChannel
} from "discord.js";
import { AstraniumClient } from "../../lib/Client";
import { CaseType } from "../../enums";
import { Command } from "../../lib/Command";
import { Constants } from "../../constants";
import type { ModerationCase } from "@prisma/client";
import { SlashCommandInteraction } from "../../types";

export default class BanCommand extends Command {
    public constructor() {
        super("ban", {
            args: [
                {
                    name: "member",
                    description: "The member to ban.",
                    required: true,
                    type: ApplicationCommandOptionType.User
                },
                {
                    name: "reason",
                    description: "The reason for banning the member.",
                    required: false,
                    type: ApplicationCommandOptionType.String
                }
            ],
            category: "Moderation",
            description: "Bans a specified member from the server.",
            examples: ["ban @tncz", "ban @tncz Being toxic"],
            permissions: {
                user: ["BanMembers"]
            },
            usage: "ban <member> [reason]"
        });
    }

    public async exec(
        client: AstraniumClient,
        interaction: SlashCommandInteraction<"cached">
    ): Promise<void> {
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
                    where: { memberId: member.id, type: CaseType.BAN }
                })
            ).length + 1 ?? 1;
        let caseId: string = client.util.generateKey(18);

        while (
            await client.db.moderationCase.findUnique({ where: { caseId } })
        ) {
            caseId = client.util.generateKey(18);
        }

        if (
            interaction.member.roles.highest.comparePositionTo(
                member.roles.highest
            ) <= 0
        ) {
            return client.util.warn(interaction, {
                message:
                    "You cannot ban the member as they have either higher or similiar roles."
            });
        }

        if (!member.bannable) {
            return client.util.warn(interaction, {
                message: "Unable to ban the member as they are not bannable."
            });
        }

        await member
            .ban({
                deleteMessageSeconds: Infinity, // Note: add option for message clearing
                reason: reason ?? undefined
            })
            .then(async (): Promise<void> => {
                if (!member.user.bot) {
                    await client.db.moderationCase
                        .create({
                            data: {
                                caseId,
                                memberId: member.id,
                                moderatorId: interaction.member.id,
                                reason: reason ?? undefined,
                                type: CaseType.BAN
                            }
                        })
                        .then(
                            async (
                                moderationCase: ModerationCase
                            ): Promise<void> => {
                                if (moderationLogs) {
                                    await moderationLogs.send({
                                        embeds: [
                                            client.util.embed({
                                                author: {
                                                    name: `${member.user.tag} - Server Ban (Case ID ${caseId})`,
                                                    iconURL:
                                                        member.user.displayAvatarURL()
                                                },
                                                description: `${member} was banned at ${client.formatter.time(
                                                    moderationCase.date
                                                )}. This is their **${caseNumber}${client.formatter.suffix(
                                                    caseNumber
                                                )}** moderation case and **${warnNumber}${client.formatter.suffix(
                                                    warnNumber
                                                )}** server ban.`,
                                                fields: [
                                                    {
                                                        name: "Responsible Moderator",
                                                        value: interaction.member.toString(),
                                                        inline: true
                                                    },
                                                    {
                                                        name: "Ban Reason",
                                                        value: moderationCase.reason,
                                                        inline: true
                                                    }
                                                ]
                                            })
                                        ]
                                    });
                                }

                                await interaction.reply({
                                    embeds: [
                                        client.util.embed({
                                            description: `${Constants.Emojis.white_check_mark} Successfully banned ${member} from the server (**ID ${moderationCase.caseId}**)`
                                        })
                                    ],
                                    ephemeral: true
                                });
                            }
                        );
                } else {
                    if (moderationLogs) {
                        await moderationLogs.send({
                            embeds: [
                                client.util.embed({
                                    author: {
                                        name: `${member.user.tag} - Server Ban (Case ID ${caseId})`,
                                        iconURL: member.user.displayAvatarURL()
                                    },
                                    description: `${member} was banned at ${client.formatter.time(
                                        Date.now()
                                    )}.`,
                                    fields: [
                                        {
                                            name: "Responsible Moderator",
                                            value: interaction.member.toString(),
                                            inline: true
                                        },
                                        {
                                            name: "Ban Reason",
                                            value:
                                                reason ??
                                                "No reason was provided by the moderator.",
                                            inline: true
                                        }
                                    ]
                                })
                            ]
                        });
                    }

                    await interaction.reply({
                        embeds: [
                            client.util.embed({
                                description: `${Constants.Emojis.white_check_mark} Successfully banned ${member} from the server.`
                            })
                        ],
                        ephemeral: true
                    });
                }
            });
    }
}
