import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import { AstraniumClient } from "@lib/Client";
import { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";

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

		if (member.user.bot) {
			return client.util.warn(interaction, {
				message: "The specified member cannot be a bot user."
			});
		}

		const { xp }: { xp: number } = await client.util.syncMember(member);
		const pendingXp: number = xp - amount;

		await client.util
			.setXp(client, {
				xp: pendingXp,
				member
			})
			.then((): void =>
				client.util.success(interaction, {
					message: `Successfully removed **${amount}** xp from ${member}. They now have **${pendingXp}** xp.`
				})
			);
	}
}
