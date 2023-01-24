import { Command } from "@lib/Command";

import ViewSubCommand from "../subcommands/moderation/cases/View.subcommand";

export default class CasesCommand extends Command {
	public constructor() {
		super("cases", {
			category: "Moderation",
			description: "View moderation case(s) of a server member.",
			permissions: {
				user: ["ModerateMembers"]
			},
			subcommands: [new ViewSubCommand()],
			usage: "cases view"
		});
	}
}
