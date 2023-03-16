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

export default class KickCommand extends Command {
	public constructor() {
		super("kick", {
			args: [
				{
					name: "member",
					description: "The member to kick.",
					required: true,
					type: ApplicationCommandOptionType.User
				},
				{
					name: "reason",
					description: "The reason for kicking the member.",
					required: false,
					type: ApplicationCommandOptionType.String
				}
			],
			category: "Moderation",
			description: "Kicks a specified member from the server.",
			examples: ["kick @tncz", "kick @tncz Being toxic"],
			permissions: {
				user: ["KickMembers"]
			},
			usage: "kick <member> [reason]"
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
					where: { memberId: member.id, type: CaseType.KICK }
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
					"You cannot kick the member as they have either higher or similiar roles."
			});
		}

		if (!member.kickable) {
			return client.util.warn(interaction, {
				message: "Unable to kick the member as they are not kickable."
			});
		}

		await member.kick(reason ?? undefined).then(async (): Promise<void> => {
			if (!member.user.bot) {
				await client.db.moderationCase
					.create({
						data: {
							caseId,
							memberId: member.id,
							moderatorId: interaction.member.id,
							reason: reason ?? undefined,
							type: CaseType.KICK
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
												name: `${member.user.tag} - Server Kick (Case ID ${caseId})`,
												iconURL:
													member.user.displayAvatarURL()
											},
											description: `${member} was kicked at ${client.formatter.time(
												moderationCase.date
											)}. This is their **${caseNumber}${client.formatter.suffix(
												caseNumber
											)}** moderation case and **${warnNumber}${client.formatter.suffix(
												warnNumber
											)}** server kick.`,
											fields: [
												{
													name: "Responsible Moderator",
													value: interaction.member.toString(),
													inline: true
												},
												{
													name: "Kick Reason",
													value: moderationCase.reason,
													inline: true
												}
											]
										})
									]
								});
							}

							client.util.success(interaction, {
								message: `Successfully kicked ${member} from the server (**ID ${moderationCase.caseId}**)`
							});
						}
					);
			} else {
				if (moderationLogs) {
					await moderationLogs.send({
						embeds: [
							client.util.embed({
								author: {
									name: `${member.user.tag} - Server Kick (Case ID ${caseId})`,
									iconURL: member.user.displayAvatarURL()
								},
								description: `${member} was kicked at ${client.formatter.time(
									Date.now()
								)}.`,
								fields: [
									{
										name: "Responsible Moderator",
										value: interaction.member.toString(),
										inline: true
									},
									{
										name: "Kick Reason",
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
					message: `Successfully kicked ${member} from the server.`
				});
			}
		});
	}
}
