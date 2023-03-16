import { Command } from "@lib/Command";

import MembersSubCommand from "../subcommands/admin/sync/Members.subcommand";
import StatsSubCommand from "@subcommands/admin/sync/Stats.subcommand";

export default class SyncCommand extends Command {
	public constructor() {
		super("sync", {
			category: "Admin",
			description: "Synchronises server statistics and database members.",
			permissions: {
				user: ["Administrator"]
			},
			subcommands: [new StatsSubCommand(), new MembersSubCommand()],
			usage: "sync stats | members"
		});
	}
}
