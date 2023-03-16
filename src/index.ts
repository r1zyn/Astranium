import "module-alias/register";

import { AstraniumClient } from "@lib/Client";
import type { Guild } from "discord.js";
import { Logger } from "@lib/Logger";
import { PrismaClient } from "@prisma/client";

import { initProcess } from "@scripts/initProcess";

import config from "../astranium.config";

global.logger = new Logger();
global.prisma = new PrismaClient();

new Promise<void>(
	(resolve: (value: void | PromiseLike<void>) => void): void => {
		resolve(initProcess(config));
	}
)
	.then(async (): Promise<void> => {
		const client: AstraniumClient = new AstraniumClient(config);

		await client.start().then(async (): Promise<void> => {
			const astranium: Guild = await client.guilds.fetch(config.guildID);

			if (
				!(await client.db.guild.findUnique({
					where: { id: astranium.id }
				}))
			) {
				await client.db.guild
					.create({ data: { id: astranium.id } })
					.then((): void =>
						global.logger.info(
							"Created database entry for Astranium guild",
							"prisma"
						)
					);
			}

			await client.util.syncMembers(astranium);
			await client.util.syncStats(astranium);
			global.logger.info(
				"Synced Astranium guild members and statistics to database",
				"prisma"
			);

			const interval: NodeJS.Timer = setInterval(
				async (): Promise<void> => {
					if (process.exitCode) clearInterval(interval);

					await client.util.syncMembers(astranium);
					await client.util.syncStats(astranium);
					global.logger.info(
						"Synced Astranium guild members and statistics to database",
						"prisma"
					);
				},
				1000 * 60
			); // Note: does this execute immediately?
		});
	})
	.catch((error: Error): void => global.logger.error(error, "process", true));
