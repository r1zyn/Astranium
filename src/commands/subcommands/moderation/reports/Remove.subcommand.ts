import {
	ApplicationCommandOptionType,
	EmbedBuilder,
	GuildMember,
	Message,
	TextChannel
} from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type { Report } from "@prisma/client";
import type { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";

export default class RemoveSubCommand extends SubCommand {
	public constructor() {
		super("remove", {
			args: [
				{
					name: "id",
					description: "The id of the report.",
					required: true,
					type: ApplicationCommandOptionType.String,
					minLength: 18,
					maxLength: 18
				},
				{
					name: "reason",
					description: "The reason for removing the report.",
					required: false,
					type: ApplicationCommandOptionType.String
				}
			],
			description: "Removes a server member's report.",
			examples: [
				"remove q35sZs0yB1uNut5SXL",
				"remove q35sZs0yB1uNut5SXL Unjustified"
			],
			usage: "remove <id> [reason]"
		});
	}

	public async exec(
		client: AstraniumClient,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void | Message<boolean>> {
		const reports: TextChannel | null =
			await client.util.fetchChannel<TextChannel>(
				Constants.Channels["reports"],
				interaction.guild
			);
		const caseId: string = interaction.options.getString("id", true);
		const reason: string | null = interaction.options.getString("reason");
		const report: Report | null = await client.db.report.findUnique({
			where: { caseId }
		});

		if (!report) {
			return client.util.warn(interaction, {
				message:
					"Unable to find a member report with a matching case ID."
			});
		}

		const member: GuildMember = await client.util.fetchMember(
			interaction.guild,
			report.memberId
		);
		const reporter: GuildMember = await client.util.fetchMember(
			interaction.guild,
			report.reporterId
		);

		await client.db.report
			.delete({ where: { caseId } })
			.then(async (report: Report): Promise<void> => {
				const loggingEmbed: EmbedBuilder = client.util.embed({
					author: {
						name: `${member.user.tag} - Server Case Removal (Case ID ${report.caseId})`,
						iconURL: member.user.displayAvatarURL()
					},
					description: `Report **${
						report.caseId
					}** for ${member} (submitted by ${reporter}) was removed at ${client.formatter.time(
						new Date()
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

				if (reports) {
					await reports.send({
						embeds: [loggingEmbed]
					});
				}

				client.util.success(interaction, {
					message: `Successfully removed report for ${member} (**ID:** ${caseId})`
				});
			});
	}
}
