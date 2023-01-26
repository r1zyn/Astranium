import {
	ApplicationCommandOptionType,
	DMChannel,
	EmbedBuilder,
	GuildMember,
	Message,
	TextChannel
} from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { CaseType } from "@typings/enums";
import { Constants } from "@core/constants";
import type { ModerationCase } from "@prisma/client";
import type { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";

export default class CreateSubCommand extends SubCommand {
	public constructor() {
		super("create", {
			args: [
				{
					name: "member",
					description: "The member to timeout.",
					required: true,
					type: ApplicationCommandOptionType.User
				},
				{
					name: "duration",
					description: "The duration to timeout the member for.",
					required: true,
					type: ApplicationCommandOptionType.String
				},
				{
					name: "reason",
					description: "The reason for warning the member.",
					required: false,
					type: ApplicationCommandOptionType.String
				}
			],
			description: "Times out a server member.",
			examples: ["create @tncz 1d", "create @tncz 5d, 10h Being toxic"],
			usage: "create <member> <duration> [reason]"
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
		const member: GuildMember = await client.util.fetchMember(
			interaction.guild,
			interaction.options.getUser("member", true)
		);
		const duration: number | null = client.formatter.timestring(
			interaction.options.getString("duration", true),
			"ms"
		);
		const threshold: number | null = client.formatter.timestring(
			"28d",
			"ms"
		);
		const reason: string | null = interaction.options.getString("reason");
		const caseNumber: number =
			(
				await client.db.moderationCase.findMany({
					where: { memberId: member.id }
				})
			).length + 1 ?? 1;
		const timeoutNumber: number =
			(
				await client.db.moderationCase.findMany({
					where: { memberId: member.id, type: CaseType.TIMEOUT }
				})
			).length + 1 ?? 1;
		let caseId: string = client.util.generateKey(18);

		while (
			await client.db.moderationCase.findUnique({ where: { caseId } })
		) {
			caseId = client.util.generateKey(18);
		}

		if (member.user.bot) {
			return client.util.warn(interaction, {
				message: "The specified member cannot be a bot user."
			});
		}

		await client.util.syncMember(member);

		if (!duration) {
			return client.util.warn(interaction, {
				message: "Invalid duration provided. Example: 1d, 2h, 15m"
			});
		}

		if (threshold && duration > threshold) {
			return client.util.warn(interaction, {
				message: "The maximum timeout duration specified is 28 days."
			});
		}

		await member
			.timeout(duration, reason ?? undefined)
			.then(
				async (): Promise<ModerationCase> =>
					await client.db.moderationCase.create({
						data: {
							caseId,
							memberId: member.id,
							moderatorId: interaction.member.id,
							reason: reason ?? undefined,
							type: CaseType.TIMEOUT,
							expires: new Date(Date.now() + duration)
						}
					})
			)
			.then(async (moderationCase: ModerationCase): Promise<void> => {
				const endsAt: string = client.formatter.time(
					moderationCase.expires as Date,
					"R"
				);
				const expire: string =
					new Date() > (moderationCase.expires as Date)
						? "expired"
						: "expires";

				const memberEmbed: EmbedBuilder = client.util.embed({
					author: {
						name: `${interaction.guild.name} - Server Timeout (Case ID ${moderationCase.caseId})`,
						iconURL: interaction.guild.iconURL() ?? undefined
					},
					description: `You were timed out in ${
						interaction.guild.name
					} at ${client.formatter.time(
						moderationCase.date
					)}. This is your **${caseNumber}${client.formatter.suffix(
						caseNumber
					)}** moderation case and **${timeoutNumber}${client.formatter.suffix(
						timeoutNumber
					)}** timeout. The timeout ${expire} ${endsAt}`,
					fields: [
						{
							name: "Responsible Moderator",
							value: interaction.member.toString(),
							inline: true
						},
						{
							name: "Timeout Reason",
							value: moderationCase.reason,
							inline: true
						}
					]
				});

				const loggingEmbed: EmbedBuilder = client.util.embed({
					author: {
						name: `${member.user.tag} - Server Timeout (Case ID ${moderationCase.caseId})`,
						iconURL: member.user.displayAvatarURL()
					},
					description: `${member} was timed out at ${client.formatter.time(
						moderationCase.date
					)}. This is their **${caseNumber}${client.formatter.suffix(
						caseNumber
					)}** moderation case and **${timeoutNumber}${client.formatter.suffix(
						timeoutNumber
					)}** timeout. The timeout ${expire} ${endsAt}`,
					fields: [
						{
							name: "Responsible Moderator",
							value: interaction.member.toString(),
							inline: true
						},
						{
							name: "Timeout Reason",
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
				}

				if (moderationLogs) {
					await moderationLogs.send({
						embeds: [loggingEmbed]
					});
				}

				client.util.success(interaction, {
					message: `Successfully timed out ${member} (**ID:** ${
						moderationCase.caseId
					}) ${!isDMable ? "User was unable to be DMed." : ""}`
				});

				if (isDMable) {
					setTimeout(async (): Promise<void> => {
						if (!member.dmChannel) {
							await member
								.createDM()
								.then(
									async (
										dm: DMChannel
									): Promise<Message<false>> => {
										return await dm.send({
											embeds: [
												client.util.embed({
													description: `${Constants.Emojis["discord_notif"]} Your timeout (${moderationCase.caseId}) set by ${interaction.member} has expired.`
												})
											]
										});
									}
								);
						} else {
							await member.dmChannel.send({
								embeds: [
									client.util.embed({
										description: `${Constants.Emojis["discord_notif"]} Your timeout (${moderationCase.caseId}) set by ${interaction.member} has expired.`
									})
								]
							});
						}
					}, duration);
				}
			});
	}
}
