import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { Command } from "@lib/Command";
import type { EditSnipe } from "@typings/main";
import type { SlashCommandInteraction } from "@typings/main";

export default class EditSnipeCommand extends Command {
	public constructor() {
		super("editsnipe", {
			args: [
				{
					name: "index",
					description: "The number to index the snipes in a channel.",
					required: false,
					type: ApplicationCommandOptionType.Integer,
					minValue: 1
				}
			],
			category: "Miscellanous",
			description: "View recently edited messages in a channel.",
			examples: ["/editsnipe", "/editsnipe 2"],
			usage: "editsnipe [index]"
		});
	}

	public async exec(
		client: AstraniumClient,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void> {
		const snipes: EditSnipe[] = client.editSnipes.get(
			interaction.channelId
		) as EditSnipe[];
		const index: number | null =
			interaction.options.getInteger("index") || null;

		if (!snipes || snipes.length === 0) {
			return client.util.warn(interaction, {
				message: `Unable to find messages recently edited in ${interaction.channel}.`
			});
		} else if (index) {
			if (index > snipes.length) {
				return client.util.warn(interaction, {
					message:
						"Index provided exceeds the number of current edited messages in channel."
				});
			} else {
				const snipe: EditSnipe = snipes[snipes.length - index];

				if (!snipe) {
					return client.util.warn(interaction, {
						message:
							"No snipes exist for the provided number. Please provide a smaller number."
					});
				} else {
					const embed: EmbedBuilder = client.util.embed({
						author: {
							name: `Recently edited message by ${snipe.author.tag}`,
							iconURL: snipe.author.displayAvatarURL()
						},
						description: `${
							snipe.author
						} recently edited a message in ${snipe.channel} at ${
							snipe.time.after
						}. ${
							snipe.url
								? `Click ${client.formatter.hyperlink(
										"here",
										snipe.url
								  )} to jump to the edited message.`
								: ""
						}\n\n**Before:** ${snipe.content.before}\n**After:** ${
							snipe.content.after
						}`
					});

					if (snipe.image.before) embed.setImage(snipe.image.before);
					if (snipe.image.after) embed.setImage(snipe.image.after);

					await interaction.reply({
						embeds: [embed]
					});
				}
			}
		} else {
			const snipe: EditSnipe = snipes[snipes.length - 1];
			const embed: EmbedBuilder = client.util.embed({
				author: {
					name: `Recently edited message by ${snipe.author.tag}`,
					iconURL: snipe.author.displayAvatarURL()
				},
				description: `${snipe.author} recently edited a message in ${
					snipe.channel
				} at ${snipe.time.after}. ${
					snipe.url
						? `Click ${client.formatter.hyperlink(
								"here",
								snipe.url
						  )} to jump to the edited message.`
						: ""
				}\n\n**Before:** ${snipe.content.before}\n**After:** ${
					snipe.content.after
				}`
			});

			if (snipe.image.before) embed.setImage(snipe.image.before);
			if (snipe.image.after) embed.setImage(snipe.image.after);

			await interaction.reply({
				embeds: [embed]
			});
		}
	}
}
