import type { AstraniumClient } from "@lib/Client";
import { ChannelType, EmbedBuilder, GuildBasedChannel } from "discord.js";
import { Command } from "@lib/Command";
import { Constants } from "@core/constants";
import type { SlashCommandInteraction } from "@typings/main";

export default class ServerInfoCommand extends Command {
	public constructor() {
		super("serverinfo", {
			category: "Information",
			description: "View information on the server.",
			examples: ["serverinfo"],
			usage: "serverinfo"
		});
	}

	public async exec(
		client: AstraniumClient<true>,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void> {
		const embed: EmbedBuilder = client.util.embed({
			color: Constants["Colors"].White,
			author: {
				name: `${interaction.guild.name} - Server Information`,
				iconURL: interaction.guild.iconURL() || undefined
			},
			description: interaction.guild.description || undefined,
			fields: [
				{
					name: "Owner",
					value: client.formatter.userMention(
						interaction.guild.ownerId
					),
					inline: true
				},
				{
					name: "Member Count",
					value: interaction.guild.members.cache.size.toString(),
					inline: true
				},
				{
					name: "Roles",
					value: interaction.guild.roles.cache.size.toString(),
					inline: true
				},
				{
					name: "Text Channels",
					value: interaction.guild.channels.cache
						.filter(
							(channel: GuildBasedChannel): boolean =>
								channel.type === ChannelType.GuildText
						)
						.size.toString(),
					inline: true
				},
				{
					name: "Voice Channels",
					value: interaction.guild.channels.cache
						.filter(
							(channel: GuildBasedChannel): boolean =>
								channel.type === ChannelType.GuildVoice
						)
						.size.toString(),
					inline: true
				},
				{
					name: "Created At",
					value: client.formatter.time(interaction.guild.createdAt),
					inline: true
				}
			]
		});

		embed.setThumbnail(interaction.guild.iconURL());

		await interaction.reply({
			embeds: [embed]
		});
	}
}
