import { Command } from "@lib/Command";

export default class XpCommand extends Command {
	public constructor() {
		super("xp", {
			category: "Admin",
			description: "Alters the xp of a member.",
			examples: [
				"xp add @tncz 5",
				"xp remove @tncz 8",
				"xp set @tncz 100"
			],
			permissions: {
				user: ["Administrator"]
			},
			subcommands: [],
			usage: "xp add | remove | set"
		});
	}
}
