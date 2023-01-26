import { Command } from "@lib/Command";

import CreateSubCommand from "../subcommands/moderation/timeout/Create.subcommand";
import RemoveSubCommand from "../subcommands/moderation/timeout/Remove.subcommand";

export default class TimeoutCommand extends Command {
	public constructor() {
		super("timeout", {
			category: "Moderation",
			description: "Manages a server member's timeout.",
			permissions: {
				user: ["ModerateMembers"]
			},
			subcommands: [new CreateSubCommand(), new RemoveSubCommand()],
			usage: "timeout create | remove"
		});
	}
}
