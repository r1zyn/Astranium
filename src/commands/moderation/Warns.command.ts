import { Command } from "@lib/Command";

import AddSubCommand from "@subcommands/moderation/warns/Add.subcommand";
import ClearCommand from "@subcommands/moderation/warns/Clear.subcommand";
import RemoveSubCommand from "@subcommands/moderation/warns/Remove.subcommand";

export default class WarnsCommand extends Command {
	public constructor() {
		super("warns", {
			category: "Moderation",
			description: "Either add, remove or clears all warns for a member.",
			permissions: {
				user: ["ModerateMembers"]
			},
			subcommands: [
				new AddSubCommand(),
				new ClearCommand(),
				new RemoveSubCommand()
			],
			usage: "warns add | remove | view"
		});
	}
}
