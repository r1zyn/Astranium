import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import { AstraniumClient } from "@lib/Client";
import { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";
import type { Member, Prisma } from "@prisma/client";

export default class AddSubCommand extends SubCommand {
	public constructor() {
		super("add", {
			args: [
				{
					name: "member",
					description: "The member to add the xp to.",
					required: true,
					type: ApplicationCommandOptionType.User
				},
				{
					name: "amount",
					description: "The amount of xp to add to the member.",
					required: true,
					type: ApplicationCommandOptionType.Integer,
					minValue: 1
				}
			],
			description: "Adds a certain amount of xp to a member.",
			examples: ["add @tncz 5"],
			usage: "add <member> <amount>"
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
		const amount: number = interaction.options.getInteger("amount", true);
		const where: Prisma.MemberWhereUniqueInput = {
			id: member.id
		};

		if (member.user.bot) {
			return client.util.warn(interaction, {
				message: "The specified member cannot be a bot user."
			});
		}

		await client.util.syncMember(member);

		const { xp }: { xp: number } = (await client.db.member.findUnique({
			where
		})) as Member;
		const pendingXp: number = xp + amount;

		await client.db.member
			.update({
				where,
				data: {
					xp: pendingXp
				}
			})
			.then(({ level: currentLevel }): void => {
				client.util.success(interaction, {
					message: `Successfully added **${amount}** xp to ${member}. They now have **${pendingXp}** xp.`
				});

				const pendingLevel: number = Math.floor(
					0.1 * Math.sqrt(pendingXp)
				);

				if (pendingLevel > currentLevel) {
					client.emit(
						"memberLevelUp",
						interaction.channel,
						member,
						pendingLevel
					);
				}
			});
	}
}
