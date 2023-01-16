import {
    APIEmbed,
    ApplicationCommandOption,
    BaseFetchOptions,
    Client,
    EmbedBuilder,
    EmbedData,
    Guild,
    GuildBasedChannel,
    GuildMember,
    PermissionsString,
    version
} from "discord.js";
import { AstraniumClient } from "./Client";
import { Command } from "./Command";
import { Constants } from "../constants";
import type {
    ErrorOptions,
    MemberFetchOptions,
    SlashCommandInteraction,
    WarnOptions
} from "../types";
import { Formatter } from "./Formatter";
import { SubCommand } from "./SubCommand";

import { arch, hostname, platform, release, userInfo } from "os";
import { globalLogger } from "../utils";

import config from "../../astranium.config";

export class Util {
    public static category(dirname: string): string {
        return Formatter.capitalize(dirname.split("\\").pop() as string);
    }

    public static createOption<A extends ApplicationCommandOption, O>(
        arg: A,
        option: O
    ): O {
        Object.keys(arg).forEach((key: string): void => {
            if (key !== "type") { option[`set${Formatter.capitalize(key)}`](arg[key]); }
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
        { emitter, ephemeral = true, error, kill = false, method }: ErrorOptions
    ): void {
        globalLogger.error(error, emitter, kill);

        const embed: EmbedBuilder = this.embed({
            author: {
                name: "Whoops! Looks like an internal error occurred.",
                iconURL: interaction.client.user.displayAvatarURL()
            },
            description: `Hey there, ${interaction.user}. Looks like an internal error occurred while processing your command. Please try again later, and if the problem persists, join the and report the issue.`
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

    public static async handleSubCommands(client: AstraniumClient, command: Command, interaction: SlashCommandInteraction): Promise<void> {
        const subCommandName: string = await interaction.options.getSubcommand(true);

        if (command.subcommands) {
            command.subcommands.forEach(async (subcommand: SubCommand): Promise<void> => {
                if (subCommandName === subcommand.name) {
                    await subcommand.exec(client, interaction);
                }
            });
        }
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

    public static paginate<T extends []>(
        arr: T,
        itemsPerPage: number,
        page: number = 1
    ): T | null {
        const maxPages: number = Math.ceil(arr.length / itemsPerPage);
        if (page < 1 || page > maxPages) return null;
        return arr.slice(
            (page - 1) * itemsPerPage,
            page * itemsPerPage
        ) as T;
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
                name: `Whoops! Looks like ${isMember ? "you're" : `${client.user.username} is`
                    } missing permissions to run this command.`,
                iconURL: client.user.displayAvatarURL()
            },
            description: `Hey there, ${interaction.user
                }! Looks like you tried to run the ${Formatter.commandMention(
                    interaction.commandName,
                    interaction.commandId
                )} command, but unfortunately, due to missing permissions, ${client.user
                } was unable to run this command. To be able to run the command, ensure ${isMember ? "you have" : `${client.user} has`
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
        ].forEach((line: string | { name: string; value: string; }): void => {
            if (typeof line === "string") { console.log(line); }
            else {
                console.log(
                    `${"\u0020".repeat(3)}${line.name}${"\u0020".repeat(
                        23 - line.name.length
                    )}::  ${line.value}`
                );
            }
        });
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
