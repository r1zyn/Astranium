import { AstraniumClient } from "../../../../lib/Client";
import { SlashCommandInteraction } from "../../../../typings/main";
import { SubCommand } from "../../../../lib/SubCommand";

export default class StatsSubCommand extends SubCommand {
	public constructor() {
		super("stats", {
			description: "Syncs server statistics and database members."
		});
	}

	public async exec(
		client: AstraniumClient,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void> {
		await client.util.syncStats(interaction.guild).then((): void =>
			client.util.success(interaction, {
				message: "Successfully synchronised server statistics."
			})
		);
	}
}
