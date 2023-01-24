import { Command } from "@lib/Command";

import StartSubCommand from "../subcommands/moderation/lockdown/Start.subcommand";

export default class LockdownCommand extends Command {
	public constructor() {
		super("lockdown", {
			category: "Moderation",
			description: "Lockdowns all the channels in the server.",
			permissions: {
				user: ["ManageChannels"]
			},
			subcommands: [new StartSubCommand()],
			usage: "lockdown start | end"
		});
	}
}
