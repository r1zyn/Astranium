import {
	ApplicationCommandOptionType,
	GuildMember,
	Message,
	TextChannel
} from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { Command } from "@lib/Command";
import { Constants } from "@core/constants";
import type { Report } from "@prisma/client";
import type { SlashCommandInteraction } from "@typings/main";

export default class ReportCommand extends Command {
	public constructor() {
		super("report", {
			args: [
				{
					name: "member",
					description: "The member to report.",
					required: true,
					type: ApplicationCommandOptionType.User
				},
				{
					name: "reason",
					description: "The reason for reporting the member.",
					required: true,
					type: ApplicationCommandOptionType.String
				}
			],
			category: "Moderation",
			description: "Report a member to the server moderators.",
			examples: ["report @tncz Self advertising"],
			usage: "report <member> <message>"
		});
	}

	public async exec(
		client: AstraniumClient,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void> {
		const member: GuildMember = await client.util.fetchMember(
			interaction.guild,
			interaction.options.getUser("member", true)
		);
		const reason: string = interaction.options.getString("reason", true);
		let caseId: string = client.util.generateKey(18);

		while (await client.db.report.findUnique({ where: { caseId } })) {
			caseId = client.util.generateKey(18);
		}

		const reports: TextChannel | null =
			await client.util.fetchChannel<TextChannel>(
				Constants.Channels["reports"],
				interaction.guild,
				{
					cache: true,
					force: true
				}
			);

		if (reports) {
			await client.db.report
				.create({
					data: {
						caseId,
						memberId: member.id,
						reporterId: interaction.member.id,
						reason: reason
					}
				})
				.then(
					async (report: Report): Promise<Message> =>
						await reports.send({
							embeds: [
								client.util.embed({
									author: {
										name: `New report for ${member.user.tag} (Report ID ${report.caseId})`,
										iconURL: member.user.displayAvatarURL()
									},
									description: `${member} was reported by ${
										interaction.member
									} at ${client.formatter.time(
										report.date
									)}. The reason for the report was: **${
										report.reason
									}**`,
									fields: [
										{
											name: "Member Information",
											value: `
										**Username:** ${interaction.member}
										**Joined At:** ${
											interaction.member.joinedAt
												? client.formatter.time(
														interaction.member
															.joinedAt
												  )
												: "Unavailable"
										}
										**Created At:** ${client.formatter.time(interaction.member.user.createdAt)}
										`,
											inline: true
										},
										{
											name: "Reported Member Information",
											value: `
										**Username:** ${member}
										**Joined At:** ${
											member.joinedAt
												? client.formatter.time(
														member.joinedAt
												  )
												: "Unavailable"
										}
										**Created At:** ${client.formatter.time(member.user.createdAt)}
										`,
											inline: true
										}
									]
								})
							]
						})
				)
				.then((): void =>
					client.util.success(interaction, {
						message:
							"Successfully submitted your report to the server moderators."
					})
				);
		}
	}
}
