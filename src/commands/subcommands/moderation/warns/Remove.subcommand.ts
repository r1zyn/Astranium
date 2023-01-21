import {
	ApplicationCommandOptionType,
	EmbedBuilder,
	GuildMember,
	Message,
	TextChannel
} from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type { ModerationCase } from "@prisma/client";
import type { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";

export default class RemoveSubCommand extends SubCommand {
	public constructor() {
		super("remove", {
			args: [
				{
					name: "id",
					description: "The id of the warn case.",
					required: true,
					type: ApplicationCommandOptionType.String
				},
				{
					name: "reason",
					description: "The reason for removing the warn.",
					required: false,
					type: ApplicationCommandOptionType.String
				}
			],
			description: "Removes a server member's warn."
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
		const caseId: string = interaction.options.getString("id", true);
		const reason: string | null = interaction.options.getString("reason");
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

		if (
			interaction.member.roles.highest.comparePositionTo(
				member.roles.highest
			) <= 0
		) {
			return client.util.warn(interaction, {
				message:
					"The provided member has either higher or similiar roles."
			});
		}

		await client.db.moderationCase
			.delete({ where: { caseId } })
			.then(async (moderationCase: ModerationCase): Promise<void> => {
				const loggingEmbed: EmbedBuilder = client.util.embed({
					author: {
						name: `${member.user.tag} - Server Warn Removal (Case ID ${caseId})`,
						iconURL: member.user.displayAvatarURL()
					},
					description: `${member}'s warn **${caseId}** was removed at ${client.formatter.time(
						moderationCase.date
					)}.`,
					fields: [
						{
							name: "Responsible Moderator",
							value: interaction.member.toString(),
							inline: true
						},
						{
							name: "Removal Reason",
							value:
								reason ??
								"No reason was provided by the moderator.",
							inline: true
						}
					]
				});

				if (moderationLogs) {
					await moderationLogs.send({
						embeds: [loggingEmbed]
					});
				}

				client.util.success(interaction, {
					message: `Successfully removed warn from ${member} (**ID:** ${caseId})`
				});
			});
	}
}
