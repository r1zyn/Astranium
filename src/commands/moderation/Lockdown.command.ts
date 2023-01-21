import { Command } from "@lib/Command";

export default class LockdownCommand extends Command {
	public constructor() {
		super("lockdown", {
			category: "Moderation",
			description: "Lockdowns all the channels in the server.",
			examples: ["lockdown start", "lockdown end"],
			permissions: {
				user: ["ManageChannels"]
			},
			subcommands: [],
			usage: "lockdown start | end"
		});
	}
}
