import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import { AstraniumClient } from "@lib/Client";
import { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";
import type { Member, Prisma } from "@prisma/client";

export default class RemoveSubCommand extends SubCommand {
	public constructor() {
		super("remove", {
			args: [
				{
					name: "member",
					description: "The member to remove the xp from.",
					required: true,
					type: ApplicationCommandOptionType.User
				},
				{
					name: "amount",
					description: "The amount of xp to remove from the member.",
					required: true,
					type: ApplicationCommandOptionType.Integer,
					minValue: 1
				}
			],
			description: "Removes a certain amount of xp from a member.",
			examples: ["remove 10"],
			usage: "remove <member> <amount>"
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
		let pendingXp: number = xp - amount;

		if (pendingXp < 0) pendingXp = 0;
		// Note: change this so levels also derank

		await client.db.member
			.update({
				where,
				data: {
					xp: pendingXp
				}
			})
			.then((): void =>
				client.util.success(interaction, {
					message: `Successfully removed **${amount}** xp from ${member}. They now have **${pendingXp}** xp.`
				})
			);
	}
}
