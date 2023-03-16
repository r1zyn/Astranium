import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import { AstraniumClient } from "@lib/Client";
import { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";

export default class SetSubCommand extends SubCommand {
	public constructor() {
		super("set", {
			args: [
				{
					name: "member",
					description: "The member to set the xp for.",
					required: true,
					type: ApplicationCommandOptionType.User
				},
				{
					name: "amount",
					description: "The amount of xp to set for the member.",
					required: true,
					type: ApplicationCommandOptionType.Integer,
					minValue: 1
				}
			],
			description: "Sets a certain of xp amount for a member.",
			examples: ["set @tncz 500"],
			usage: "set <member> <amount>"
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

		await client.util.syncMember(member);
		await client.util
			.setXp(client, {
				xp: amount,
				member
			})
			.then((): void =>
				client.util.success(interaction, {
					message: `Successfully set the amount of xp for ${member} to **${amount}**.`
				})
			);
	}
}
