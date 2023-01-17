import type { AstraniumClient } from "../../../../lib/Client";
import { NonThreadGuildBasedChannel } from "discord.js";
import type { SlashCommandInteraction } from "../../../../types";
import { SubCommand } from "../../../../lib/SubCommand";

export default class StartSubCommand extends SubCommand {
    public constructor() {
        super("start", {
            description: "Initiates a server lockdown."
        });
    }

    public async exec(
        client: AstraniumClient,
        interaction: SlashCommandInteraction<"cached">
    ): Promise<any> {
        (await interaction.guild.channels.fetch()).forEach(
            async (channel: NonThreadGuildBasedChannel | null) => {
                if (channel) {
                    await channel.fetch();

                    // if (channel.isVoiceBased()) {
                    //     channel.permissionsFor
                    // }
                }
            }
        );

        await interaction.reply({
            content: "wqwe"
        });
    }
}
