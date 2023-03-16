import { Command } from "@lib/Command";

import AddSubCommand from "../subcommands/admin/xp/Add.subcommand";
import RemoveSubCommand from "../subcommands/admin/xp/Remove.subcommand";
import SetSubCommand from "../subcommands/admin/xp/Set.subcommand";

export default class XpCommand extends Command {
	public constructor() {
		super("xp", {
			category: "Admin",
			description: "Alters the xp of a member.",
			permissions: {
				user: ["Administrator"]
			},
			subcommands: [
				new AddSubCommand(),
				new RemoveSubCommand(),
				new SetSubCommand()
			],
			usage: "xp add | remove | set"
		});
	}
}
