import { ApplicationCommandOptionType, GuildMember, Message } from "discord.js";
import type { AstraniumClient } from "../../lib/Client";
import { Command } from "../../lib/Command";
import type { ModerationCase } from "@prisma/client";
import type { SlashCommandInteraction } from "../../typings/main";

export default class CaseCommand extends Command {
	public constructor() {
		super("case", {
			args: [
				{
					name: "id",
					description: "The id of the warn case.",
					required: true,
					type: ApplicationCommandOptionType.String
				}
			],
			category: "Moderation",
			description: "View a specific moderation case of a member.",
			examples: ["case q35sZs0yB1uNut5SXL"],
			permissions: {
				user: ["ModerateMembers"]
			},
			usage: "case <id>"
		});
	}

	public async exec(
		client: AstraniumClient,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void | Message<boolean>> {
		const caseId: string = interaction.options.getString("id", true);
		const moderationCase: ModerationCase | null =
			await client.db.moderationCase.findUnique({ where: { caseId } });

		if (!moderationCase) {
			return client.util.warn(interaction, {
				message:
					"Unable to find a moderation case with a matching case ID."
			});
		}

		const member: GuildMember = await interaction.guild.members.fetch(
			moderationCase.memberId
		);
		const moderator: GuildMember = await interaction.guild.members.fetch(
			moderationCase.moderatorId
		);

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
			).length ?? 0;
		const caseTypeNumber: number =
			(
				await client.db.moderationCase.findMany({
					where: { memberId: member.id, type: moderationCase.type }
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
