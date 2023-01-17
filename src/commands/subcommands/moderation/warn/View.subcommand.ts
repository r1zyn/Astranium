import { ApplicationCommandOptionType, GuildMember, Message } from "discord.js";
import type { AstraniumClient } from "../../../../lib/Client";
import { CaseType } from "../../../../enums";
import type { ModerationCase } from "@prisma/client";
import type { SlashCommandInteraction } from "../../../../types";
import { SubCommand } from "../../../../lib/SubCommand";

export default class ViewSubCommand extends SubCommand {
    public constructor() {
        super("view", {
            args: [
                {
                    name: "id",
                    description: "The id of the warn case.",
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            description: "View a server member's warn case."
        });
    }

    public async exec(
        client: AstraniumClient,
        interaction: SlashCommandInteraction<"cached">
    ): Promise<void | Message<boolean>> {
        const caseId: string = interaction.options.getString("id", true);
        const warnCase: ModerationCase | null =
            await client.db.moderationCase.findUnique({ where: { caseId } });

        if (!warnCase) {
            return client.util.warn(interaction, {
                message: "Unable to find a warn case with a matching case ID."
            });
        }

        const member: GuildMember = await interaction.guild.members.fetch(
            warnCase.memberId
        );
        const moderator: GuildMember = await interaction.guild.members.fetch(
            warnCase.moderatorId
        );

        const caseNumber: number =
            (
                await client.db.moderationCase.findMany({
                    where: { memberId: member.id }
                })
            ).length ?? 0;
        const warnNumber: number =
            (
                await client.db.moderationCase.findMany({
                    where: { memberId: member.id, type: CaseType.WARN }
                })
            ).length ?? 0;

        await interaction.reply({
            embeds: [
                client.util.embed({
                    author: {
                        name: `${member.user.tag} - Server Warn (Case ID ${caseId})`,
                        icon_url: member.user.displayAvatarURL()
                    },
                    description: `${member} was warned at ${client.formatter.time(
                        warnCase.date
                    )}. They currently have **${caseNumber}** moderation cases and **${warnNumber}** server warns.`,
                    fields: [
                        {
                            name: "Responsible Moderator",
                            value: moderator.toString(),
                            inline: true
                        },
                        {
                            name: "Warn Reason",
                            value: warnCase.reason,
                            inline: true
                        }
                    ]
                })
            ]
        });
    }
}
