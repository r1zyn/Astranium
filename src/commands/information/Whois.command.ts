import {
	ActionRowBuilder,
	Activity,
	ActivityType,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	GuildMember,
	User
} from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { Command } from "@lib/Command";
import { Constants } from "@core/constants";
import type { ClientPlatform, SlashCommandInteraction } from "@typings/main";

export default class WhoisCommand extends Command {
	public constructor() {
		super("whois", {
			args: [
				{
					name: "member",
					description: "The member to view information on.",
					required: false,
					type: ApplicationCommandOptionType.User
				}
			],
			category: "Information",
			description: "View information on a server member.",
			examples: ["whois", "whois @tncz"],
			usage: "whois [member]"
		});
	}

	public async exec(
		client: AstraniumClient<true>,
		interaction: SlashCommandInteraction<"cached">
	): Promise<void> {
		const user: User | null = interaction.options.getUser("member");
		const member: GuildMember = user
			? await interaction.guild.members.fetch(user)
			: interaction.member;
		const hasNitro: string = (await client.util.hasNitro(member))
			? "Yes"
			: "No";
		const status: string = member.presence?.status
			? client.formatter.userStatus(member.presence.status)
			: "Invisible";
		const customStatus: string = client.formatter.userActivity(member);
		const platform: ClientPlatform | null =
			client.formatter.userPlatform(member);
		const acknowledgements: string = client.formatter
			.userAcknowledgements(member)
			.join("\n");
		const flags: string = client.formatter.userFlags(member);
		const roles: string = client.formatter.roles(member.roles.cache, 40);
		const permissions: string = client.formatter
			.permissions(member.permissions.toArray())
			.join(", ");
		const banner: string | null | undefined = member.user.bannerURL();
		const avatars: string[] = client.formatter.userAvatars(member);
		const cases: number = await client.db.moderationCase.count({
			where: {
				memberId: member.id,
				type: "WARN"
			}
		});
		const reports: number = await client.db.report.count({
			where: {
				memberId: member.id
			}
		});

		const embed: EmbedBuilder = client.util.embed({
			author: {
				name: member.user.tag,
				iconURL: member.user.displayAvatarURL()
			},
			color: member.user.accentColor || Constants["Colors"].Invisible,
			thumbnail: {
				url: member.user.displayAvatarURL()
			},
			description: client.formatter.userMention(member.id),
			fields: [
				{
					name: "« General Information »",
					value: `**• Username/Tag:** ${
						member.user.tag
					}\n**• User ID:** ${
						member.user.id
					}\n**• Created At:** ${client.formatter.time(
						member.user.createdAt
					)} (${client.formatter.time(
						member.user.createdAt,
						"R"
					)})\n**• Bot Account:** ${
						member.user.bot ? "Yes" : "No"
					}\n**• Nitro Account:** ${hasNitro}${
						member.user.hexAccentColor
							? `\n**• Banner Color:** ${member.user.hexAccentColor}`
							: ""
					}`
				},
				{
					name: "« Member Information »",
					value: `**• Server Nickname:** ${
						member.nickname || "None"
					}\n**• Joined At:** ${client.formatter.time(
						member.joinedAt as Date
					)} (${client.formatter.time(
						member.joinedAt as Date,
						"R"
					)})\n**• Server Warns:** ${cases}\n**• Reports:** ${reports}\n**• Server Booster:** ${
						member.premiumSince ? "Yes" : "No"
					}`
				},
				{
					name: "« Acknowledgements »",
					value: acknowledgements,
					inline: true
				},
				{
					name: "« Discord Badges »",
					value: flags || "• None",
					inline: true
				},
				{
					name: `« Roles [${member.roles.cache.size}] »`,
					value: roles
				},
				{
					name: `« Permissions [${
						member.permissions.toArray().length
					}] »`,
					value: permissions
				}
			]
		});

		if (member.presence) {
			embed.addFields({
				name: "« Presence »",
				value: `**• Status:** ${status}${
					platform ? `\n**• Platform:** ${platform}\n` : "\n"
				}**• Custom Status:** ${
					customStatus || "None"
				}\n**• Activities:** ${member.presence.activities.length}`
			});
		} else {
			embed.addFields({
				name: "« Presence »",
				value: "**• Status:** Offline"
			});
		}

		if (member.presence && member.presence.activities) {
			member.presence.activities
				.filter(
					(activity: Activity): boolean =>
						activity.type !== ActivityType.Custom
				)
				.forEach((activity: Activity): void => {
					const details: string[] = [];
					if (activity.details) details.push(`${activity.details}`);
					if (activity.state) {
						if (activity.party) {
							if (activity.party.size) {
								details.push(
									`${activity.state} (${activity.party.size[0]} of ${activity.party.size[1]})`
								);
							} else if (activity.name === "Spotify") {
								details.push(`by ${activity.state}`);
							} else {
								details.push(`${activity.state}`);
							}
						} else if (activity.name === "Spotify") {
							details.push(`by ${activity.state}`);
						} else {
							details.push(activity.state);
						}
					}

					const activityStatus: string = `${
						Constants.ActivityType[activity.type]
					} ${activity.name}`;

					if (!activity.details && !activity.state)
						details.push(activityStatus);

					if (activity.timestamps) {
						if (activity.timestamps.end)
							details.push(
								`${client.formatter.difference(
									activity.timestamps.start as Date,
									activity.timestamps.end
								)} left`
							);
						else
							details.push(
								`${client.formatter.difference(
									activity.timestamps.start as Date,
									new Date()
								)} elapsed`
							);
					}

					embed.addFields({
						name: activityStatus,
						value: details.join("\n"),
						inline: true
					});
				});
		}

		const components: ButtonBuilder[] = [
			new ButtonBuilder()
				.setLabel("Avatar (png)")
				.setStyle(ButtonStyle.Link)
				.setURL(avatars[0]),
			new ButtonBuilder()
				.setLabel("Avatar (webp)")
				.setStyle(ButtonStyle.Link)
				.setURL(avatars[1]),
			new ButtonBuilder()
				.setLabel("Avatar (jpg)")
				.setStyle(ButtonStyle.Link)
				.setURL(avatars[3]),
			new ButtonBuilder()
				.setLabel("Avatar (jpeg)")
				.setStyle(ButtonStyle.Link)
				.setURL(avatars[4])
		];

		if (banner) {
			components.push(
				new ButtonBuilder()
					.setLabel("Banner")
					.setStyle(ButtonStyle.Link)
					.setURL(banner)
			);
		}

		await interaction.reply({
			embeds: [embed],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					...components
				)
			]
		});
	}
}
