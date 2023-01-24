import { Command } from "@lib/Command";

import RemoveSubCommand from "../subcommands/moderation/reports/Remove.subcommand";
import ViewSubCommand from "../subcommands/moderation/reports/View.subcommand";

export default class ReportsCommand extends Command {
	public constructor() {
		super("reports", {
			category: "Moderation",
			description: "Handle server member reports.",
			permissions: {
				user: ["ModerateMembers"]
			},
			subcommands: [new ViewSubCommand(), new RemoveSubCommand()],
			usage: "reports view | remove"
		});
	}
}
