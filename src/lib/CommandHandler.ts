import { AstraniumClient } from "./Client";
import { Category } from "./Category";
import { CacheType, Collection, GuildMember, Interaction } from "discord.js";
import { Command } from "./Command";
import { REST, Routes } from "discord.js";

import { existsSync, readdirSync, statSync } from "fs";

export class CommandHandler {
    public aliases: Collection<string, Command>;
    public categories: Collection<string, Category<Command>>;
    private client: AstraniumClient;
    public commands: Collection<string, Command>;
    public options: CommandHandlerOptions;
    public rest: REST;

    public constructor(
        client: AstraniumClient,
        options: CommandHandlerOptions
    ) {
        this.aliases = new Collection<string, Command>();
        this.categories = new Collection<string, Category<Command>>();
        this.client = client;
        this.commands = new Collection<string, Command>();
        this.options = options;
        this.rest = new REST().setToken(client.config.token);
    }

    public async init(): Promise<void> {
        await this.loadCommands();
        await this.registerCommands();
        await this.listen();
    }

    public async listen(): Promise<void> {
        this.client.on(
            "interactionCreate",
            async (interaction: Interaction<CacheType>): Promise<void> => {
                if (!interaction.isChatInputCommand()) return;
                if (interaction.user.bot) return;

                const command: Command | undefined =
                    this.commands.get(interaction.commandName) ||
                    this.aliases.get(interaction.commandName);
                if (!command) return;

                if (
                    command.ownerOnly &&
                    !this.client.config.owners.includes(interaction.user.id)
                ) {
                    interaction.reply({
                        embeds: [
                            this.client.util.embed({
                                author: {
                                    name: "You've stumbled upon a big secret...",
                                    iconURL: interaction.user.displayAvatarURL()
                                },
                                description: `Hey there, ${
                                    interaction.user
                                }! Looks like you tried to run the ${this.client.formatter.commandMention(
                                    interaction.commandName,
                                    interaction.commandId
                                )} command, but this command has been reserved for the developers only. Commands marked with the owner only permission indicate that the command is exclusively available only to the developers.`,
                                footer: {
                                    text: "Can't change permissions? Try contacting a server administrator to resolve this issue."
                                }
                            })
                        ],
                        ephemeral: true
                    });

                    return;
                }

                if (interaction.inCachedGuild()) {
                    if (
                        !(await this.client.db.member.findUnique({
                            where: { id: interaction.member.id }
                        }))
                    ) {
                        await this.client.db.member
                            .create({ data: { id: interaction.member.id } })
                            .catch((error: Error): void =>
                                this.client.logger.error(
                                    error,
                                    "commandHandler",
                                    false
                                )
                            );
                    }

                    if (command.permissions) {
                        const me: GuildMember | null =
                            interaction.guild.members.me;
                        if (!me) return;

                        if (command.permissions.client) {
                            if (
                                !me.permissions.has("Administrator") &&
                                !me.permissions.has(command.permissions.client)
                            ) {
                                interaction.reply({
                                    embeds: [
                                        this.client.util.permissionsEmbed(
                                            interaction,
                                            command.permissions.client,
                                            me
                                        )
                                    ],
                                    ephemeral: true
                                });

                                return;
                            }
                        }
                    }
                }

                try {
                    await command.exec(this.client, interaction);
                } catch (error) {
                    this.client.util.error(interaction, {
                        emitter: `${command.name}Command`,
                        ephemeral: true,
                        error,
                        kill: false,
                        method: "reply"
                    });
                }
            }
        );
    }

    /**
     * Loads slash commands from `.command.js` files (compiled from original `.command.ts` files).
     */
    public async loadCommands(): Promise<void> {
        if (!existsSync(this.options.directory)) {
            return this.client.logger.error(
                `The specified command directory "${this.options.directory}" does not exist`,
                "commandHandler",
                true
            );
        }

        if (!statSync(this.options.directory).isDirectory()) {
            return this.client.logger.error(
                `The specified command directory "${this.options.directory}" is invalid`,
                "commandHandler",
                true
            );
        }

        try {
            for (const subdirectory of readdirSync(
                this.options.directory
            ).filter((subdirectory: string): boolean =>
                statSync(
                    `${this.options.directory}/${subdirectory}`
                ).isDirectory()
            )) {
                for (const file of readdirSync(
                    `${this.options.directory}/${subdirectory}`
                ).filter((file: string): boolean =>
                    file.endsWith(".command.js")
                )) {
                    const Instance: new () => Command = (
                        (await import(
                            `${this.options.directory}/${subdirectory}/${file}`
                        )) as { default: new () => Command }
                    ).default;
                    if (!Instance) {
                        return this.client.logger.error(
                            `Default export of ${this.options.directory}/${subdirectory}/${file} is not instance of Command class`,
                            "commandHandler",
                            true
                        );
                    }

                    const isCommand: boolean =
                        Instance.prototype instanceof Command;
                    if (!isCommand) {
                        return this.client.logger.error(
                            `Default export of ${this.options.directory}/${subdirectory}/${file} is not instance of Command class`,
                            "commandHandler",
                            true
                        );
                    }

                    const command: Command = new Instance();
                    command.exec = Instance.prototype.exec;

                    if (!this.categories.get(command.category.toLowerCase())) {
                        this.categories.set(
                            command.category.toLowerCase(),
                            new Category<Command>(
                                command.category.toLowerCase(),
                                {
                                    data: new Collection<string, Command>(),
                                    name: command.category.toLowerCase()
                                }
                            )
                        );
                    }

                    const category: Category<Command> | undefined =
                        this.categories.get(command.category.toLowerCase());
                    category && category.data.set(command.name, command);

                    this.commands.set(command.name, command);

                    if (command.aliases) {
                        for (const alias of command.aliases) {
                            const aliasCommand: Command = new Instance();
                            aliasCommand.setName(alias);
                            aliasCommand.exec = Instance.prototype.exec;
                            this.aliases.set(alias, aliasCommand);
                        }
                    }
                }
            }

            for (const file of readdirSync(this.options.directory)
                .filter((subfile: string): boolean =>
                    statSync(`${this.options.directory}/${subfile}`).isFile()
                )
                .filter((file: string): boolean =>
                    file.endsWith(".command.js")
                )) {
                const Instance: new () => Command = (
                    (await import(`${this.options.directory}/${file}`)) as {
                        default: new () => Command;
                    }
                ).default;
                if (!Instance) {
                    return this.client.logger.error(
                        `Default export of ${this.options.directory}/${file} is not instance of Command class`,
                        "commandHandler",
                        true
                    );
                }

                const isCommand: boolean =
                    Instance.prototype instanceof Command;
                if (!isCommand) {
                    return this.client.logger.error(
                        `Default export of ${this.options.directory}/${file} is not instance of Command class`,
                        "commandHandler",
                        true
                    );
                }

                const command: Command = new Instance();
                command.exec = Instance.prototype.exec;

                if (!this.categories.get(command.category.toLowerCase())) {
                    this.categories.set(
                        command.category.toLowerCase(),
                        new Category<Command>(command.category.toLowerCase(), {
                            data: new Collection<string, Command>(),
                            name: command.category.toLowerCase()
                        })
                    );
                }

                const category: Category<Command> | undefined =
                    this.categories.get(command.category.toLowerCase());
                category && category.data.set(command.name, command);

                this.commands.set(command.name, command);

                if (command.aliases) {
                    for (const alias of command.aliases) {
                        const aliasCommand: Command = new Instance();
                        aliasCommand.setName(alias);
                        aliasCommand.exec = Instance.prototype.exec;
                        this.aliases.set(alias, aliasCommand);
                    }
                }
            }

            if (this.commands.size === 0) {
                this.client.logger.warn(
                    "No slash commands were loaded from command directory",
                    "commandHandler"
                );
            }

            this.client.logger.info(
                `Successfully loaded ${this.commands.size} slash command(s) from command directory`,
                "commandHandler"
            );
            this.aliases.size > 0 &&
                this.client.logger.info(
                    `Successfully loaded ${this.aliases.size} alias command(s) from command directory`,
                    "commandHandler"
                );
            this.client.logger.info(
                `Successfully loaded ${this.categories.size} slash command categories`,
                "commandHandler"
            );
        } catch (error) {
            this.client.logger.error(error.stack, "commandHandler", true);
        }
    }

    /**
     * Registers loaded slash commands to the Discord API.
     */
    public async registerCommands(): Promise<void> {
        return await this.rest
            .put(
                Routes.applicationGuildCommands(
                    this.client.config.clientID,
                    this.client.config.guildID
                ),
                {
                    body: this.commands.concat(this.aliases).toJSON()
                }
            )
            .then((data: any): void =>
                this.client.logger.info(
                    `Successfully registered ${data.length} application commands (including aliases)`,
                    "commandHandler"
                )
            )
            .catch((error: Error): void =>
                this.client.logger.error(error, "commandHandler", true)
            );
    }
}

/**
 * Options for the command handler.
 */
export interface CommandHandlerOptions {
    /**
     * Directory to load commands from.
     */
    directory: string;
}
