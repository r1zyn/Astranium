import { AstraniumClient } from "./Client";
import {
    ApplicationCommandAttachmentOption,
    ApplicationCommandAutocompleteNumericOption,
    ApplicationCommandAutocompleteStringOption,
    ApplicationCommandBooleanOption,
    ApplicationCommandChannelOption,
    ApplicationCommandMentionableOption,
    ApplicationCommandNumericOption,
    ApplicationCommandOption,
    ApplicationCommandOptionType,
    ApplicationCommandRoleOption,
    ApplicationCommandStringOption,
    ApplicationCommandUserOption,
    CommandInteraction,
    PermissionFlagsBits,
    PermissionsString,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandSubcommandsOnlyBuilder,
    SlashCommandUserOption
} from "discord.js";
import { SlashCommandInteraction } from "../types";
import { SubCommand } from "./SubCommand";
import { Util } from "./Util";

export class Command extends SlashCommandBuilder {
    public aliases?: string[];
    public args?: ApplicationCommandOption[];
    public category: string;
    public examples: string[];
    public permissions?: CommandPermissions;
    public ownerOnly: boolean;
    public subcommands?: SubCommand[];
    public usage: string;

    public constructor(name: string, options: CommandOptions) {
        super();

        this.setAliases(options.aliases);
        options.args && this.setArgs(options.args);
        this.setCategory(options.category);
        options.permissions &&
            options.permissions.user &&
            this.setDefaultMemberPermissions(
                options.permissions.user
                    .map(
                        (permission: PermissionsString): bigint =>
                            PermissionFlagsBits[permission]
                    )
                    .reduce((a: bigint, b: bigint): bigint => a | b)
            );
        this.setDescription(
            options.description ||
                "No description has been provided for this command."
        );
        this.setDescriptionLocalizations(
            options.descriptionLocalisations
                ? options.descriptionLocalisations
                : {}
        );
        this.setDMPermission(
            options.permissions ? options.permissions.allowDMs : false
        );
        this.setExamples(options.examples);
        this.setOwnerOnly(options.ownerOnly ? options.ownerOnly : false);
        this.setPermissions(options.permissions);
        this.setName(name);
        this.setNameLocalizations(
            options.nameLocalisations ? options.nameLocalisations : {}
        );
        options.subcommands && this.setSubCommands(options.subcommands);
        this.setUsage(options.usage);

        options.args &&
            options.args.forEach((arg: ApplicationCommandOption): void => {
                switch (arg.type) {
                    case ApplicationCommandOptionType.Attachment: {
                        this.addAttachmentOption(
                            (
                                option: SlashCommandAttachmentOption
                            ): SlashCommandAttachmentOption =>
                                Util.createOption<
                                    ApplicationCommandAttachmentOption,
                                    SlashCommandAttachmentOption
                                >(arg, option)
                        );
                        break;
                    }

                    case ApplicationCommandOptionType.Boolean: {
                        this.addBooleanOption(
                            (
                                option: SlashCommandBooleanOption
                            ): SlashCommandBooleanOption =>
                                Util.createOption<
                                    ApplicationCommandBooleanOption,
                                    SlashCommandBooleanOption
                                >(arg, option)
                        );
                        break;
                    }

                    case ApplicationCommandOptionType.Channel: {
                        this.addChannelOption(
                            (
                                option: SlashCommandChannelOption
                            ): SlashCommandChannelOption =>
                                Util.createOption<
                                    ApplicationCommandChannelOption,
                                    SlashCommandChannelOption
                                >(arg, option)
                        );
                        break;
                    }

                    case ApplicationCommandOptionType.Integer: {
                        this.addIntegerOption(
                            (
                                option: SlashCommandIntegerOption
                            ): SlashCommandIntegerOption =>
                                Util.createOption<
                                    | ApplicationCommandAutocompleteNumericOption
                                    | ApplicationCommandNumericOption,
                                    SlashCommandIntegerOption
                                >(arg, option)
                        );
                        break;
                    }

                    case ApplicationCommandOptionType.Mentionable: {
                        this.addMentionableOption(
                            (
                                option: SlashCommandMentionableOption
                            ): SlashCommandMentionableOption =>
                                Util.createOption<
                                    ApplicationCommandMentionableOption,
                                    SlashCommandMentionableOption
                                >(arg, option)
                        );
                        break;
                    }

                    case ApplicationCommandOptionType.Number: {
                        this.addNumberOption(
                            (
                                option: SlashCommandNumberOption
                            ): SlashCommandNumberOption =>
                                Util.createOption<
                                    | ApplicationCommandAutocompleteNumericOption
                                    | ApplicationCommandNumericOption,
                                    SlashCommandNumberOption
                                >(arg, option)
                        );
                        break;
                    }

                    case ApplicationCommandOptionType.Role: {
                        this.addRoleOption(
                            (
                                option: SlashCommandRoleOption
                            ): SlashCommandRoleOption =>
                                Util.createOption<
                                    ApplicationCommandRoleOption,
                                    SlashCommandRoleOption
                                >(arg, option)
                        );
                        break;
                    }

                    case ApplicationCommandOptionType.String: {
                        this.addStringOption(
                            (
                                option: SlashCommandStringOption
                            ): SlashCommandStringOption =>
                                Util.createOption<
                                    | ApplicationCommandAutocompleteStringOption
                                    | ApplicationCommandStringOption,
                                    SlashCommandStringOption
                                >(arg, option)
                        );
                        break;
                    }

                    case ApplicationCommandOptionType.User: {
                        this.addUserOption(
                            (
                                option: SlashCommandUserOption
                            ): SlashCommandUserOption =>
                                Util.createOption<
                                    ApplicationCommandUserOption,
                                    SlashCommandUserOption
                                >(arg, option)
                        );
                        break;
                    }
                }
            });
        
        options.subcommands &&
            options.subcommands.forEach((subcommand: SubCommand): SlashCommandSubcommandsOnlyBuilder => this.addSubcommand(subcommand));
    }

    public async exec(
        client: AstraniumClient,
        interaction: SlashCommandInteraction
    ): Promise<any> {
        this.subcommands ? await client.util.handleSubCommands(client, this, interaction) : client.logger.error(
            `Command class ${this.constructor.name} "exec" method has not been implemented`,
            `${this.constructor.name.replace("Command", "")}Command`,
            true
        );
    }

    public setAliases(aliases?: string[]): this {
        this.aliases = aliases;
        return this;
    }

    public setArgs(args: ApplicationCommandOption[]): this {
        this.args = args;
        return this;
    }

    public setCategory(category: string): this {
        this.category = category;
        return this;
    }

    public setExamples(examples: string[]): this {
        this.examples = examples;
        return this;
    }

    public setOwnerOnly(ownerOnly: boolean): this {
        this.ownerOnly = ownerOnly;
        return this;
    }

    public setPermissions(permissions?: CommandPermissions): this {
        this.permissions = permissions;
        return this;
    }

    public setUsage(usage: string): this {
        this.usage = usage;
        return this;
    }

    public setSubCommands(subcommands: SubCommand[]): this {
        this.subcommands = subcommands;
        return this;
    }
}

export interface CommandPermissions {
    allowDMs?: boolean;
    client?: PermissionsString[];
    user?: PermissionsString[];
}

export interface CommandOptions {
    aliases?: string[];
    args?: ApplicationCommandOption[];
    category: string;
    description?: string;
    descriptionLocalisations?: Localizations;
    examples: string[];
    nameLocalisations?: Localizations;
    ownerOnly?: boolean;
    permissions?: CommandPermissions;
    subcommands?: SubCommand[];
    usage: string;
}

export type Localizations = Partial<
    Record<
        | "en-US"
        | "en-GB"
        | "bg"
        | "zh-CN"
        | "zh-TW"
        | "hr"
        | "cs"
        | "da"
        | "nl"
        | "fi"
        | "fr"
        | "de"
        | "el"
        | "hi"
        | "hu"
        | "it"
        | "ja"
        | "ko"
        | "lt"
        | "no"
        | "pl"
        | "pt-BR"
        | "ro"
        | "ru"
        | "es-ES"
        | "sv-SE"
        | "th"
        | "tr"
        | "uk"
        | "vi",
        null | string
    >
>;
