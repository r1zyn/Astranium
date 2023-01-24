import {
	ApplicationCommandOptionType,
	GuildMember,
	Message,
	User
} from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";

import type { ModerationCase } from "@prisma/client";
import type { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";
export default class ViewSubCommand extends SubCommand {
	public constructor() {
		super("view", {
			args: [
				{
					name: "member",
					description: "The member to view the case(s) of.",
					required: true,
					type: ApplicationCommandOptionType.User
				},
				{
					name: "id",
					description: "The id of the warn case.",
					required: false,
					type: ApplicationCommandOptionType.String,
					minLength: 18,
					maxLength: 18
				}
			],
			description: "View moderation case(s) of a server member.",
			examples: ["view @tncz", "view @tncz q35sZs0yB1uNut5SXL"],
			usage: "view <member> [id]"
		});
	}

	public async exec(
		client: AstraniumClient,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void | Message<boolean>> {
		const caseId: string | null = interaction.options.getString(
			"id",
			false
		);

		function formatCase(
			moderationCase: ModerationCase,
			index: number
		): string {
			return `**${Constants.Emojis["discord_id"]} ${
				moderationCase.caseId
			} | No #${index + 1} | Case Type: ${client.formatter.caseType(
				moderationCase.type
			)} | ${client.formatter.time(moderationCase.date)}**\n${
				Constants.Emojis["discord_reply"]
			} ${moderationCase.reason} - ${client.formatter.userMention(
				moderationCase.moderatorId
			)} `;
		}

		if (!caseId) {
			const user: User = interaction.options.getUser("member", true);
			const member: GuildMember = await interaction.guild.members.fetch(
				user
			);
			const cases: string[] = (
				await client.db.moderationCase.findMany({
					where: { memberId: member.id }
				})
			).map(formatCase);

			if (cases.length === 0) {
				return client.util.warn(interaction, {
					message:
						"No moderation cases were found for the specified server member."
				});
			}

			await client.util.syncMember(member);

			await client.util.paginate<string[]>(cases, 4, interaction, {
				author: {
					name: `${member.user.tag} - Server Moderation Cases`,
					iconURL: member.user.displayAvatarURL()
				},
				footer: {
					text: `${cases.length} moderation cases in total (run /cases view <member> [id] to view a specific case)`
				}
			});
		} else {
			const moderationCase: ModerationCase | null =
				await client.db.moderationCase.findFirst({
					where: {
						caseId,
						memberId: interaction.options.getUser("member", true).id
					}
				});

			if (!moderationCase) {
				return client.util.warn(interaction, {
					message:
						"Unable to find a moderation case with a matching case ID."
				});
			}

			const member: GuildMember = await interaction.guild.members.fetch(
				moderationCase.memberId
			);
			const moderator: GuildMember =
				await interaction.guild.members.fetch(
					moderationCase.moderatorId
				);

			await client.util.syncMember(member);

			const caseNumber: number =
				(
					await client.db.moderationCase.findMany({
						where: { memberId: member.id }
					})
				).length ?? 0;
			const caseTypeNumber: number =
				(
					await client.db.moderationCase.findMany({
						where: {
							memberId: member.id,
							type: moderationCase.type
						}
					})
				).length ?? 0;

			await interaction.reply({
				embeds: [
					client.util.embed({
						author: {
							name: `${
								member.user.tag
							} - Server ${client.formatter.caseType(
								moderationCase.type
							)} (Case ID ${caseId})`,
							icon_url: member.user.displayAvatarURL()
						},
						description: `${member} was ${client.formatter
							.caseType(moderationCase.type)
							.toLowerCase()}ed at ${client.formatter.time(
							moderationCase.date
						)}. They currently have **${caseNumber}** moderation cases and **${caseTypeNumber}** server ${client.formatter
							.caseType(moderationCase.type)
							.toLowerCase()}s.`,
						fields: [
							{
								name: "Responsible Moderator",
								value: moderator.toString(),
								inline: true
							},
							{
								name: `${client.formatter.caseType(
									moderationCase.type
								)} Reason`,
								value: moderationCase.reason,
								inline: true
							}
						]
					})
				]
			});
		}
	}
}
