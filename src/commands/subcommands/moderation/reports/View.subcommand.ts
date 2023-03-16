import { ApplicationCommandOptionType, GuildMember, User } from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type { Report } from "@prisma/client";
import type { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";

export default class ViewSubCommand extends SubCommand {
	public constructor() {
		super("view", {
			args: [
				{
					name: "member",
					description: "Filter reports with the reported member.",
					required: true,
					type: ApplicationCommandOptionType.User
				},
				{
					name: "id",
					description: "The id of the report.",
					required: false,
					type: ApplicationCommandOptionType.String,
					minLength: 18,
					maxLength: 18
				}
			],
			description: "View a server member report.",
			examples: ["view @tncz", "view @tncz q35sZs0yB1uNut5SXL"],
			usage: "view <member> [id]"
		});
	}

	public async exec(
		client: AstraniumClient,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void> {
		const caseId: string | null = interaction.options.getString("id");

		function formatReport(report: Report, index: number): string {
			return `**${Constants.Emojis["discord_id"]} ${
				report.caseId
			} | No #${index + 1} | Case Type: Report | ${client.formatter.time(
				report.date
			)}**\n${Constants.Emojis["discord_reply"]} ${
				report.reason
			} - ${client.formatter.userMention(report.reporterId)} `;
		}

		if (!caseId) {
			const user: User = interaction.options.getUser("member", true);
			const member: GuildMember = await interaction.guild.members.fetch(
				user
			);

			if (member.user.bot) {
				return client.util.warn(interaction, {
					message: "The specified member cannot be a bot user."
				});
			}

			const cases: string[] = (
				await client.db.report.findMany({
					where: { memberId: member.id }
				})
			).map(formatReport);

			if (cases.length === 0) {
				return client.util.warn(interaction, {
					message:
						"No reports were found for the specified server member."
				});
			}

			await client.util.paginate<string[]>(cases, 4, interaction, {
				author: {
					name: `${member.user.tag} - Server Member Reports`,
					iconURL: member.user.displayAvatarURL()
				},
				footer: {
					text: `${cases.length} reports in total (run /reports view <member> [id] to view a specific report)`
				}
			});
		} else {
			const report: Report | null = await client.db.report.findUnique({
				where: { caseId }
			});

			if (!report) {
				return client.util.warn(interaction, {
					message:
						"Server member report with the provided case ID does not exist."
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

			await interaction.reply({
				embeds: [
					client.util.embed({
						author: {
							name: `Report for ${member.user.tag} (Report ID ${report.caseId})`,
							iconURL: member.user.displayAvatarURL()
						},
						description: `${member} was reported by ${reporter} at ${client.formatter.time(
							report.date
						)}. The reason for the report was: **${
							report.reason
						}**`,
						fields: [
							{
								name: "Member Information",
								value: `
								**Username:** ${reporter}
								**Joined At:** ${
									reporter.joinedAt
										? client.formatter.time(
												reporter.joinedAt
										  )
										: "Unavailable"
								}
								**Created At:** ${client.formatter.time(reporter.user.createdAt)}
								`,
								inline: true
							},
							{
								name: "Reported Member Information",
								value: `
								**Username:** ${member.user}
								**Joined At:** ${
									member.joinedAt
										? client.formatter.time(member.joinedAt)
										: "Unavailable"
								}
								**Created At:** ${client.formatter.time(member.user.createdAt)}
								`,
								inline: true
							}
						]
					})
				]
			});
		}
	}
}
