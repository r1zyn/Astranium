import {
	ApplicationCommandOptionType,
	EmbedBuilder,
	GuildMember,
	Message,
	TextChannel
} from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { CaseType } from "@typings/enums";
import { Constants } from "@core/constants";
import type { Prisma } from "@prisma/client";
import type { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";

export default class ClearSubCommand extends SubCommand {
	public constructor() {
		super("clear", {
			args: [
				{
					name: "member",
					description: "The member to clear the warns for.",
					required: true,
					type: ApplicationCommandOptionType.User
				},
				{
					name: "reason",
					description: "The reason for clearing the warns.",
					required: false,
					type: ApplicationCommandOptionType.String
				}
			],
			description: "Clears all warns of a member.",
			examples: ["clear @tncz", "clear @tncz Unjustified"],
			usage: "clear <member> [reason]"
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

		if (member.user.bot) {
			return client.util.warn(interaction, {
				message: "The specified member cannot be a bot user."
			});
		}

		await client.util.syncMember(member);

		if (
			interaction.member.roles.highest.comparePositionTo(
				member.roles.highest
			) <= 0
		) {
			return client.util.warn(interaction, {
				message:
					"You cannot remove the warns as the member has either higher or similiar roles."
			});
		}

		if (
			(
				await client.db.moderationCase.findMany({
					where: { memberId: member.id, type: CaseType.WARN }
				})
			).length === 0
		) {
			return client.util.warn(interaction, {
				message:
					"The specified member does not have any warn cases to be removed."
			});
		}

		await client.db.moderationCase
			.deleteMany({ where: { memberId: member.id, type: CaseType.WARN } })
			.then(async (batch: Prisma.BatchPayload): Promise<void> => {
				const loggingEmbed: EmbedBuilder = client.util.embed({
					author: {
						name: `${member.user.tag} - Server Warn Clear`,
						iconURL: member.user.displayAvatarURL()
					},
					description: `${member} was cleared of ${
						batch.count
					} warns at ${client.formatter.time(new Date())}.`,
					fields: [
						{
							name: "Responsible Moderator",
							value: interaction.member.toString(),
							inline: true
						},
						{
							name: "Warn Reason",
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
					message: `Successfully cleared ${batch.count} warns for ${member}`
				});
			});
	}
}
