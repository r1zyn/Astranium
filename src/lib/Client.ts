import { Client, ClientOptions, Collection } from "discord.js";
import { CommandHandler } from "@lib/CommandHandler";
import { Constants } from "@core/constants";
import type { EditSnipe, Snipe } from "@typings/main";
import { Formatter } from "@lib/Formatter";
import { ListenerHandler } from "@lib/ListenerHandler";
import { Logger } from "@lib/Logger";
import type { PrismaClient } from "@prisma/client";
import { Util } from "@lib/Util";

import { join } from "path";

export class AstraniumClient<
	Ready extends boolean = boolean
> extends Client<Ready> {
	public commandHandler: CommandHandler;
	public config: AstraniumConfig;
	public db: PrismaClient;
	public editSnipes: Collection<string, EditSnipe[]>;
	public formatter: typeof Formatter;
	public listenerHandler: ListenerHandler;
	public logger: Logger;
	public snipes: Collection<string, Snipe[]>;
	public util: typeof Util;
	public xpCooldowns: Collection<string, number>;

	public constructor(config: AstraniumConfig) {
		super(config.clientOptions);

		this.config = config;
		this.db = global.prisma;
		this.editSnipes = new Collection<string, EditSnipe[]>();
		this.formatter = Formatter;
		this.logger = new Logger();
		this.snipes = new Collection<string, Snipe[]>();
		this.util = Util;
		this.xpCooldowns = new Collection<string, number>();

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
