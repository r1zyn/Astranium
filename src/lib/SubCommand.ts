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
	SlashCommandAttachmentOption,
	SlashCommandBooleanOption,
	SlashCommandChannelOption,
	SlashCommandIntegerOption,
	SlashCommandMentionableOption,
	SlashCommandNumberOption,
	SlashCommandRoleOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandUserOption
} from "discord.js";
import type { AstraniumClient } from "./Client";
import type { Localizations } from "./Command";
import { Util } from "./Util";

export class SubCommand extends SlashCommandSubcommandBuilder {
	public args?: ApplicationCommandOption[];

	public constructor(name: string, options: SubCommandOptions) {
		super();

		options.args && this.setArgs(options.args);
		this.setDescription(
			options.description ||
				"No description has been provided for this command."
		);
		this.setDescriptionLocalizations(
			options.descriptionLocalisations
				? options.descriptionLocalisations
				: {}
		);
		this.setName(name);
		this.setNameLocalizations(
			options.nameLocalisations ? options.nameLocalisations : {}
		);

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
	}

	public async exec(
		client: AstraniumClient,
		_interaction: CommandInteraction
	): Promise<any> {
		client.logger.error(
			`Command class ${this.constructor.name} "exec" method has not been implemented`,
			`${this.constructor.name.replace("Command", "")}Command`,
			true
		);
	}

	public setArgs(args: ApplicationCommandOption[]): this {
		this.args = args;
		return this;
	}
}

export interface SubCommandOptions {
	args?: ApplicationCommandOption[];
	description?: string;
	descriptionLocalisations?: Localizations;
	nameLocalisations?: Localizations;
}
