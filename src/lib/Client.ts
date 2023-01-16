import { Client, ClientOptions } from "discord.js";
import { CommandHandler } from "./CommandHandler";
import { Constants } from "../constants";
import { Formatter } from "./Formatter";
import { ListenerHandler } from "./ListenerHandler";
import { Logger } from "./Logger";
import { PrismaClient } from "@prisma/client";
import { Util } from "./Util";

import { globalLogger } from "../utils";
import { join } from "path";

export class AstraniumClient<
    Ready extends boolean = boolean
> extends Client<Ready> {
    public commandHandler: CommandHandler;
    public config: AstraniumConfig;
    public db: PrismaClient;
    public formatter: typeof Formatter;
    public listenerHandler: ListenerHandler;
    public logger: Logger;
    public util: typeof Util;

    public constructor(config: AstraniumConfig) {
        super(config.clientOptions);

        this.config = config;
        this.db = Constants.Prisma;
        this.formatter = Formatter;
        this.logger = globalLogger;
        this.util = Util;

        this.commandHandler = new CommandHandler(this, {
            directory: join(__dirname, "..", "commands")
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: join(__dirname, "..", "listeners")
        });
    }

    private async init(): Promise<void> {
        console.log(Constants.Banner);
        this.util.reportStats();

        await this.commandHandler.init();
        await this.listenerHandler.init();
        await this.db
            .$connect()
            .then((): void =>
                this.logger.ready(
                    "Succesfully established Prisma connection to SQLite database",
                    "prisma"
                )
            );
    }

    public async start(): Promise<string> {
        await this.init();
        return super.login(this.config.token);
    }
}

export interface AstraniumConfig {
    clientID: string;
    clientOptions: ClientOptions;
    guildID: string;
    release: string;
    name: string;
    owners: string[];
    token: string;
    version: string;
}
