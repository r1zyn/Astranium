import { AstraniumClient } from "@lib/Client";
import { SlashCommandInteraction } from "@typings/main";
import { SubCommand } from "@lib/SubCommand";

export default class MembersSubCommand extends SubCommand {
	public constructor() {
		super("members", {
			description: "Synchronises database members.",
			examples: ["members"],
			usage: "members"
		});
	}

	public async exec(
		client: AstraniumClient,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void> {
		await client.util.syncMembers(interaction.guild).then((): void =>
			client.util.success(interaction, {
				message: "Successfully synchronised database members."
			})
		);
	}
}
