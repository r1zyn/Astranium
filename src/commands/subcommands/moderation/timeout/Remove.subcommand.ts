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

export default class RemoveSubCommand extends SubCommand {
	public constructor() {
		super("remove", {
			args: [
				{
					name: "member",
					description: "The member to remove the timeout from.",
					required: true,
					type: ApplicationCommandOptionType.User
				},
				{
					name: "reason",
					description: "The reason for removing the timeout.",
					required: false,
					type: ApplicationCommandOptionType.String
				}
			],
			description: "Removes a member's timeout.",
			examples: ["remove @tncz", "remove @tncz Unjustified"],
			usage: "remove <member> [reason]"
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
		const reason: string | null = interaction.options.getString("reason");

		if (member.user.bot) {
			return client.util.warn(interaction, {
				message: "The specified member cannot be a bot user."
			});
		}

		if (!member.isCommunicationDisabled()) {
			return client.util.warn(interaction, {
				message: "The specified member is not currently in timeout."
			});
		}

		await member
			.timeout(null, reason ?? undefined)
			.then(async (): Promise<void> => {
				const moderationCase: ModerationCase = (
					await client.db.moderationCase.findMany({
						where: {
							memberId: member.id,
							type: CaseType.TIMEOUT
						}
					})
				)[0];

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
						name: `${member.user.tag} - Server Timeout Removal (Case ID ${moderationCase.caseId})`,
						iconURL: member.user.displayAvatarURL()
					},
					description: `Your timeout **${
						moderationCase.caseId
					}** was removed by ${
						interaction.member
					} at ${client.formatter.time(
						new Date()
					)}. The timeout ${expire} ${endsAt}`,
					fields: [
						{
							name: "Responsible Moderator",
							value: interaction.member.toString(),
							inline: true
						},
						{
							name: "Timeout Removal Reason",
							value: moderationCase.reason,
							inline: true
						}
					]
				});

				const loggingEmbed: EmbedBuilder = client.util.embed({
					author: {
						name: `${member.user.tag} - Server Timeout Removal (Case ID ${moderationCase.caseId})`,
						iconURL: member.user.displayAvatarURL()
					},
					description: `${member}'s timeout **${
						moderationCase.caseId
					}** was removed by ${
						interaction.member
					} at ${client.formatter.time(
						new Date()
					)}. The timeout ${expire} ${endsAt}`,
					fields: [
						{
							name: "Responsible Moderator",
							value: interaction.member.toString(),
							inline: true
						},
						{
							name: "Timeout Removal Reason",
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
					message: `Successfully removed timed out from ${member} (**ID:** ${
						moderationCase.caseId
					}) ${!isDMable ? "User was unable to be DMed." : ""}`
				});
			});
	}
}
