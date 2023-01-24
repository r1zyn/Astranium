import { Command } from "@lib/Command";

export default class XpCommand extends Command {
	public constructor() {
		super("xp", {
			category: "Admin",
			description: "Alters the xp of a member.",
			permissions: {
				user: ["Administrator"]
			},
			subcommands: [],
			usage: "xp add | remove | set"
		});
	}
}
