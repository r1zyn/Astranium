import "module-alias/register";

import { AstraniumClient } from "@lib/Client";
import type { Guild } from "discord.js";
import { Logger } from "@lib/Logger";
import { PrismaClient } from "@prisma/client";

import { initProcess } from "@scripts/initProcess";

import config from "../astranium.config";

global.logger = new Logger();
global.prisma = new PrismaClient();

new Promise((resolve: (value: unknown) => void): void => {
	resolve(initProcess(config));
})
	.then(async (): Promise<void> => {
		const client: AstraniumClient = new AstraniumClient(config);
		client.start();

		if (client.isReady()) {
			const astranium: Guild = await client.guilds.fetch(config.guildID);

			if (
				!(await client.db.guild.findUnique({
					where: { id: astranium.id }
				}))
			) {
				await client.db.guild.create({ data: { id: astranium.id } });
			}

			setInterval(async (): Promise<void> => {
				await client.util.syncMembers(astranium);
				global.logger.info(
					"Synced Astranium guild members to database",
					"prisma"
				);
			}, 1000 * 60);
		}
	})
	.catch((error: Error): void => global.logger.error(error, "process", true));
