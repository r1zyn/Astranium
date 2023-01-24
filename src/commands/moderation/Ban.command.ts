import {
	ApplicationCommandOptionType,
	GuildMember,
	TextChannel
} from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { CaseType } from "@typings/enums";
import { Command } from "@lib/Command";
import { Constants } from "@core/constants";
import type { ModerationCase } from "@prisma/client";
import type { SlashCommandInteraction } from "@typings/main";

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
				},
				{
					name: "clear",
					description:
						"Determines whether to delete all messages sent by the member within 14 days.",
					required: false,
					type: ApplicationCommandOptionType.Boolean
				}
			],
			category: "Moderation",
			description: "Bans a specified member from the server.",
			examples: ["ban @tncz", "ban @tncz Being toxic"],
			permissions: {
				user: ["BanMembers"]
			},
			usage: "ban <member> [reason] [clear]"
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
		const clear: boolean = interaction.options.getBoolean("clear") || false;

		if (
			!(await client.db.member.findUnique({ where: { id: member.id } }))
		) {
			await client.db.member.create({ data: { id: member.id } });
		}

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

		await client.util.syncMember(member);

		await member
			.ban({
				deleteMessageSeconds: clear ? Infinity : undefined,
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

								client.util.success(interaction, {
									message: `Successfully banned ${member} from the server (**ID ${moderationCase.caseId}**)`
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

					client.util.success(interaction, {
						message: `Successfully banned ${member} from the server.`
					});
				}
			});
	}
}
