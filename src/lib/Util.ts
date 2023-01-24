import {
	ActionRowBuilder,
	APIEmbed,
	ApplicationCommandOption,
	BaseFetchOptions,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CacheType,
	Client,
	ComponentType,
	EmbedBuilder,
	EmbedData,
	Guild,
	GuildBasedChannel,
	GuildMember,
	GuildScheduledEvent,
	InteractionCollector,
	InteractionReplyOptions,
	InteractionResponse,
	Message,
	MessageReaction,
	PermissionsString,
	User,
	version,
	VoiceChannel,
	Webhook,
	WebhookCreateMessageOptions
} from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import type { Command } from "@lib/Command";
import { Constants } from "@core/constants";
import type {
	ErrorOptions,
	MemberFetchOptions,
	SlashCommandInteraction,
	WarnOptions
} from "@typings/main";
import { Formatter } from "@lib/Formatter";
import type { SubCommand } from "@lib/SubCommand";

import { arch, hostname, platform, release, userInfo } from "os";
import fetch, { Response } from "node-fetch";

import config from "../../astranium.config";

export class Util {
	public static category(dirname: string): string {
		return Formatter.capitalize(dirname.split("\\").pop() as string);
	}

	public static async chatbot(message: Message): Promise<void> {
		await fetch(
			`http://api.brainshop.ai/get?bid=${process.env.BID}&key=${
				process.env.BRAINSHOP_API_KEY
			}&uid=${message.author.id}&msg=${encodeURIComponent(
				message.content
			)}`
		)
			.then((res: Response): Promise<any> => res.json())
			.then((json: any): Promise<Message> => message.reply(json.cnt))
			.catch((): null => null);
	}

	public static createOption<A extends ApplicationCommandOption, O>(
		arg: A,
		option: O
	): O {
		Object.keys(arg).forEach((key: string): void => {
			if (key !== "type") {
				option[`set${Formatter.capitalize(key)}`](arg[key]);
			}
		});

		return option;
	}

	public static embed(options: APIEmbed | EmbedData): EmbedBuilder {
		return new EmbedBuilder(
			options.color
				? options
				: {
						...(options as Omit<EmbedData, "color">),
						color: Constants.Embed.colors.default
				  }
		);
	}

	public static error(
		interaction: SlashCommandInteraction,
		{
			emitter,
			ephemeral = true,
			error,
			kill = false,
			method = "reply"
		}: ErrorOptions
	): void {
		global.logger.error(error, emitter, kill);

		const embed: EmbedBuilder = this.embed({
			author: {
				name: "Whoops! Looks like an internal error occurred.",
				iconURL: interaction.client.user.displayAvatarURL()
			},
			description: `Hey there, ${
				interaction.user
			}. Looks like an internal error occurred while processing your command. Please try again later, and if the problem persists, feel free to report this in ${Formatter.channelMention(
				Constants.Channels["forums"]
			)}.`
		});

		if (method === "reply" || !interaction.channel) {
			interaction.reply({
				embeds: [embed],
				ephemeral: ephemeral
			});
		} else {
			interaction.channel.send({
				embeds: [embed]
			});
		}
	}

	public static async eventData(
		event: GuildScheduledEvent,
		guild: Guild
	): Promise<WebhookCreateMessageOptions> {
		const userCount: number = (await event.fetchSubscribers()).size;
		const data: WebhookCreateMessageOptions = {
			content: `${Formatter.roleMention(Constants.Roles["event_ping"])} ${
				event.creator
			} created a new event! ${userCount} people are currently interested in this event.`,
			embeds: [await this.eventEmbed(event, guild)]
		};

		if (event.isActive() || event.isScheduled()) {
			data.components = [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setURL(event.url)
						.setLabel("View Event")
				)
			];
		}

		return data;
	}

	private static async eventEmbed(
		event: GuildScheduledEvent,
		guild: Guild
	): Promise<EmbedBuilder> {
		return this.embed({
			author: {
				name: this.eventStatus(event),
				iconURL:
					(await guild.fetchWebhooks())
						.find(
							(w: Webhook): boolean =>
								w.url === Constants.Webhooks["events"].url
						)
						?.avatarURL() ?? undefined,
				url: event.url
			},
			title: event.name,
			url: event.url,
			description: event.description ?? undefined
		}).setThumbnail(event.coverImageURL());
	}

	private static eventStatus(event: GuildScheduledEvent): string {
		const startDate: Date | null = event.scheduledStartTimestamp
			? new Date(event.scheduledStartTimestamp)
			: null;

		if (event.isActive()) return "Happening now";
		if (event.isCanceled()) return "Cancelled";
		if (event.isCompleted()) return "Ended";
		if (event.isScheduled() && startDate) {
			return `${Formatter.day(startDate.getDay())} ${Formatter.month(
				startDate.getMonth()
			)} ${startDate.getDate()}${Formatter.suffix(
				startDate.getDate()
			)} ${startDate.getHours().toString().padStart(2, "0")}:${startDate
				.getMinutes()
				.toString()
				.padStart(2, "0")}`;
		}

		return "";
	}

	public static async fetchChannel<ChannelType = GuildBasedChannel>(
		channelId: string,
		guild: Guild,
		options?: BaseFetchOptions
	): Promise<ChannelType | null> {
		return (await guild.channels.fetch(
			channelId,
			options
		)) as ChannelType | null;
	}

	public static async fetchMember(
		guild: Guild,
		options: MemberFetchOptions
	): Promise<GuildMember> {
		return await guild.members.fetch(options);
	}

	public static generateKey(length: number): string {
		const result: string[] = [];
		const characters: string =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (let i: number = 0; i < length; i++) {
			result.push(
				characters.charAt(Math.floor(Math.random() * characters.length))
			);
		}

		return result.join("");
	}

	public static async handleSubCommands(
		client: AstraniumClient,
		command: Command,
		interaction: SlashCommandInteraction
	): Promise<void> {
		const subCommandName: string = interaction.options.getSubcommand(true);

		if (command.subcommands) {
			command.subcommands.forEach(
				async (subcommand: SubCommand): Promise<void> => {
					if (subCommandName === subcommand.name) {
						try {
							await subcommand.exec(client, interaction);
						} catch (error) {
							client.util.error(interaction, {
								emitter: `${command.name}Command`,
								error
							});
						}
					}
				}
			);
		}
	}

	public static async paginate<T extends any[] = any[]>(
		arr: T,
		itemsPerPage: number,
		interaction: SlashCommandInteraction<"cached">,
		embedOptions?: Omit<EmbedData, "description">
	): Promise<void> {
		let currentPage: number = 1;
		const data: InteractionReplyOptions[] = [];
		const maxPages: number = Math.ceil(arr.length / itemsPerPage);

		for (let i: number = 0; i < maxPages; i++) {
			const page: number = i + 1;
			const pages: T = arr.slice(
				(page - 1) * itemsPerPage,
				page * itemsPerPage
			) as T;

			const embed: EmbedBuilder = this.embed({
				...(embedOptions as Omit<
					typeof embedOptions,
					"author" | "footer"
				>),
				author: {
					name: `${embedOptions?.author?.name} (Page ${page}/${maxPages})`,
					iconURL: embedOptions?.author?.iconURL,
					url: embedOptions?.author?.url
				},
				description: pages.join("\n"),
				footer: {
					text: `Viewing page ${i + 1}/${maxPages}${
						embedOptions?.footer?.text
							? `  •  ${embedOptions.footer.text}`
							: ""
					}`,
					iconURL: embedOptions?.footer?.iconURL
				}
			});

			data.push({
				embeds: [embed],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setCustomId("first")
							.setLabel("❰❰")
							.setDisabled(i === 0),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Secondary)
							.setCustomId("previous")
							.setLabel("❰")
							.setDisabled(i === 0),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Secondary)
							.setCustomId("next")
							.setLabel("❱")
							.setDisabled(i === maxPages - 1),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setCustomId("last")
							.setLabel("❱❱")
							.setDisabled(i === maxPages - 1)
					)
				]
			});
		}

		const buttons: string[] = ["first", "previous", "next", "last"];
		const msg: InteractionResponse<boolean> = await interaction.reply(
			data[0]
		);

		if (!interaction.channel) return;
		const collector: InteractionCollector<ButtonInteraction<CacheType>> =
			msg.createMessageComponentCollector({
				filter: (i: ButtonInteraction<CacheType>): boolean =>
					i.isButton() && buttons.includes(i.customId),
				componentType: ComponentType.Button
			});

		collector.on(
			"collect",
			(collected: ButtonInteraction<CacheType>): void => {
				if (collected.user.id !== interaction.member.user.id) {
					return this.warn(interaction, {
						message:
							"This interaction is not available for you to use."
					});
				}

				switch (collected.customId) {
					case "first":
						currentPage = 1;
						collected.deferUpdate();
						interaction.editReply(data[0]);
						break;
					case "previous":
						currentPage--;
						collected.deferUpdate();
						interaction.editReply(data[currentPage - 1]);
						break;
					case "next":
						currentPage++;
						collected.deferUpdate();
						interaction.editReply(data[currentPage - 1]);
						break;
					case "last":
						currentPage = data.length - 1;
						collected.deferUpdate();
						interaction.editReply(data[data.length - 1]);
						break;
				}
			}
		);
	}

	public static permissionsEmbed(
		interaction: SlashCommandInteraction,
		permissions: PermissionsString[],
		member: GuildMember
	): EmbedBuilder {
		const client: Client<true> = interaction.client;
		const isMember: boolean = interaction.client.user.id === member.user.id;

		return this.embed({
			author: {
				name: `Whoops! Looks like ${
					isMember ? "you're" : `${client.user.username} is`
				} missing permissions to run this command.`,
				iconURL: client.user.displayAvatarURL()
			},
			description: `Hey there, ${
				interaction.user
			}! Looks like you tried to run the ${Formatter.commandMention(
				interaction.commandName,
				interaction.commandId
			)} command, but unfortunately, due to missing permissions, ${
				client.user
			} was unable to run this command. To be able to run the command, ensure ${
				isMember ? "you have" : `${client.user} has`
			} the following permissions: ${Formatter.missingPermissions(
				member,
				permissions
			)}`,
			footer: {
				text: "Can't change permissions? Try contacting a server administrator to resolve this issue."
			}
		});
	}

	public static reportStats(): void {
		[
			"\n",
			{ name: "Version", value: `v${config.version}` },
			{ name: "Release", value: config.release.toLowerCase() },
			{
				name: "Operating System",
				value: `${platform()} ${arch()} (${release()} Release)`
			},
			{
				name: "Current User",
				value: `${userInfo().username} (${hostname()})`
			},
			{ name: "Node.js Version", value: process.version },
			{ name: "discord.js Version", value: `v${version}` },
			"\n"
		].forEach((line: string | { name: string; value: string }): void => {
			if (typeof line === "string") {
				console.log(line);
			} else {
				console.log(
					`${"\u0020".repeat(3)}${line.name}${"\u0020".repeat(
						23 - line.name.length
					)}::  ${line.value}`
				);
			}
		});
	}

	public static success(
		interaction: SlashCommandInteraction,
		{ ephemeral = true, message, method = "reply" }: WarnOptions
	): void {
		const embed: EmbedBuilder = this.embed({
			description: `${Constants.Emojis["white_check_mark"]} ${message}`
		});

		if (method === "reply" || !interaction.channel) {
			interaction.reply({
				embeds: [embed],
				ephemeral
			});
		} else {
			interaction.channel.send({
				embeds: [embed]
			});
		}
	}

	public static async syncMember(member: GuildMember): Promise<void> {
		if (
			!(await global.prisma.member.findUnique({
				where: { id: member.id }
			})) &&
			!member.user.bot
		) {
			await global.prisma.member.create({ data: { id: member.id } });
		}
	}

	public static async syncMembers(guild: Guild): Promise<void> {
		(await guild.members.fetch()).forEach(this.syncMember);
	}

	public static async syncStats(guild: Guild): Promise<void> {
		const allMembers: VoiceChannel | null =
			await this.fetchChannel<VoiceChannel>(
				Constants.Channels["all_members"],
				guild
			);
		const members: VoiceChannel | null =
			await this.fetchChannel<VoiceChannel>(
				Constants.Channels["members"],
				guild
			);
		const bots: VoiceChannel | null = await this.fetchChannel<VoiceChannel>(
			Constants.Channels["bots"],
			guild
		);
		const boosters: VoiceChannel | null =
			await this.fetchChannel<VoiceChannel>(
				Constants.Channels["boost_level"],
				guild
			);

		if (!allMembers || !members || !bots || !boosters) return;

		allMembers.setName(
			allMembers.name.replace(/\d+/, guild.memberCount.toString())
		);

		members.setName(
			members.name.replace(
				/\d+/,
				guild.members.cache
					.filter((m: GuildMember): boolean => !m.user.bot)
					.size.toString()
			)
		);

		bots.setName(
			bots.name.replace(
				/\d+/,
				guild.members.cache
					.filter((m: GuildMember): boolean => m.user.bot)
					.size.toString()
			)
		);

		boosters.setName(
			boosters.name.replace(/\d+/, guild.premiumTier.toString())
		);
	}

	public static async verifyMember(
		reaction: MessageReaction,
		user: User
	): Promise<void> {
		if (reaction.message.guild) {
			const member: GuildMember = await this.fetchMember(
				reaction.message.guild,
				user.id
			);

			if (member.roles.cache.has(Constants.Roles["member"])) return;

			member.roles.add([
				Constants.Roles["level"],
				Constants.Roles["roles"],
				Constants.Roles["member"],
				Constants.Roles["about"],
				Constants.Roles["pings"]
			]);

			await this.syncMember(member);
		}
	}

	public static warn(
		interaction: SlashCommandInteraction,
		{ ephemeral = true, message, method = "reply" }: WarnOptions
	): void {
		const embed: EmbedBuilder = this.embed({
			description: `${Constants.Emojis["white_cross"]} ${message}`
		});

		if (method === "reply" || !interaction.channel) {
			interaction.reply({
				embeds: [embed],
				ephemeral
			});
		} else {
			interaction.channel.send({
				embeds: [embed]
			});
		}
	}
}
