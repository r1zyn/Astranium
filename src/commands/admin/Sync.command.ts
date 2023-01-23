import { Command } from "@lib/Command";

import StatsSubCommand from "@subcommands/admin/sync/Stats.subcommand";

export default class SyncCommand extends Command {
	public constructor() {
		super("sync", {
			category: "Admin",
			description: "Synchronises server statistics and database members.",
			examples: ["sync stats"],
			permissions: {
				user: ["Administrator"]
			},
			subcommands: [new StatsSubCommand()],
			usage: "sync stats"
		});
	}
}
