// Note: figure out why src/ doesn't work for paths

import { ApplicationCommandOptionType, GuildMember, User } from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { Command } from "@lib/Command";
import { Constants } from "@core/constants";
import type { ModerationCase } from "@prisma/client";
import type { SlashCommandInteraction } from "@typings/main";

export default class CasesCommand extends Command {
	public constructor() {
		super("cases", {
			args: [
				{
					name: "member",
					description: "The member to view the moderation cases for.",
					required: false,
					type: ApplicationCommandOptionType.User
				}
			],
			category: "Moderation",
			description:
				"View the list of moderation cases for a server member.",
			examples: ["cases", "cases @tncz"],
			permissions: {
				user: ["ModerateMembers"]
			},
			usage: "cases [member]"
		});
	}

	public async exec(
		client: AstraniumClient,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void> {
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

		const user: User | null = interaction.options.getUser("member");
		const member: GuildMember = user
			? await interaction.guild.members.fetch(user)
			: interaction.member;
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
				text: `${cases.length} moderation cases in total (run /case <id> to view a specific case)`
			}
		});
	}
}
