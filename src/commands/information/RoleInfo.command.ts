import { ApplicationCommandOptionType, Role } from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { Command } from "@lib/Command";
import type { SlashCommandInteraction } from "@typings/main";

export default class RoleInfoCommand extends Command {
	public constructor() {
		super("roleinfo", {
			args: [
				{
					name: "role",
					description: "The role to view information on.",
					required: true,
					type: ApplicationCommandOptionType.Role
				}
			],
			category: "Information",
			description: "View information on specified a role.",
			examples: ["roleinfo @Member"],
			usage: "roleinfo <role>"
		});
	}

	public async exec(
		client: AstraniumClient<true>,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void> {
		const role: Role = interaction.options.getRole("role", true);
		const colourImage: string = client.util.colourImageURL(
			role.hexColor.slice(1, role.hexColor.length),
			`${600}x${600}`
		);

		await interaction.reply({
			embeds: [
				client.util.embed({
					color: role.color,
					author: {
						name: `${role.name} - Role Information`,
						iconURL: colourImage
					},
					description: client.formatter.roleMention(role.id),
					thumbnail: {
						url: colourImage
					},
					fields: [
						{
							name: "« General Information »",
							value: `
							** • Role ID:** ${role.id}
							** • Members:** ${role.members.size}
							** • Position:** ${role.position}
							** • Managed:** ${role.managed ? "Yes" : "No"}
							** • Created:** ${client.formatter.time(role.createdAt)}
							`
						},
						{
							name: "« Display Information »",
							value: `
							** • Name:** ${role.name}
							** • Hex Colour:** ${role.hexColor}
							** • Hoisted:** ${role.hoist ? "Yes" : "No"}
							** • Mentionable:** ${role.mentionable ? "Yes" : "No"}
							${role.unicodeEmoji ? `** • Unicode Emoji:** ${role.unicodeEmoji}` : ""}
							`
						},
						{
							name: `« Permissions [${
								role.permissions.toArray().length
							}] »`,
							value: client.formatter
								.permissions(role.permissions.toArray())
								.join(", ")
						}
					]
				})
			]
		});
	}
}
