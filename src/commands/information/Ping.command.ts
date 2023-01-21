import type { AstraniumClient } from "@lib/Client";
import { Command } from "@lib/Command";
import { Constants } from "@core/constants";
import type { Message } from "discord.js";
import type { SlashCommandInteraction } from "@typings/main";

export default class PingCommand extends Command {
	public constructor() {
		super("ping", {
			category: "information",
			description:
				"Returns your round-trip time, websocket ping and client uptime.",
			examples: ["ping"],
			permissions: {
				allowDMs: true
			},
			usage: "ping"
		});
	}

	public async exec(
		client: AstraniumClient<true>,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void | Message<boolean>> {
		const message: Message = await interaction.reply({
			embeds: [
				client.util.embed({
					description: `${Constants.Emojis["discord_loading"]} Pinging...`
				})
			],
			fetchReply: true
		});

		const seconds: number = client.uptime / 1000;
		const minutes: number = Math.round(seconds / 60);
		const hours: number = Math.round(seconds / 60 / 60);
		const days: number = Math.round(seconds / 60 / 60 / 24);

		// Note: custom ms/moment?

		return interaction.editReply({
			embeds: [
				client.util.embed({
					author: {
						name: `${client.user.username} - RTT, Websocket Ping and Client Uptime`,
						iconURL: client.user.displayAvatarURL({
							extension: "png"
						})
					},
					thumbnail: {
						url: client.user?.displayAvatarURL({
							extension: "png"
						})
					},
					// description: `**:ping_pong: Pong! Received response from ${Constants.Emojis["astranium"]} ${client.user?.username} in \`${(message.createdTimestamp - interaction.createdTimestamp).toFixed(2) }ms\`**`,
					fields: [
						{
							name: `${Constants.Emojis["loading_bar"]} Round-trip Time`,
							value: client.formatter.languageCodeBlock(
								"md",
								`> ${(
									message.createdTimestamp -
									interaction.createdTimestamp
								).toFixed(2)}ms`
							),
							inline: true
						},
						// Make network emoji dynamic
						{
							name: `${Constants.Emojis["network_bars"]} Websocket Ping`,
							value: client.formatter.languageCodeBlock(
								"md",
								`> ${client.ws.ping.toFixed(2)}ms`
							),
							inline: true
						},
						{
							name: `${Constants.Emojis["clyde"]} Client Uptime`,
							value: client.formatter.languageCodeBlock(
								"md",
								`> ${days}d, ${hours}h, ${minutes}m`
							),
							inline: true
						}
					]
				})
			]
		});
	}
}
