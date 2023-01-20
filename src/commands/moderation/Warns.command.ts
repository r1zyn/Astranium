import { Command } from "../../lib/Command";

import AddSubCommand from "../subcommands/moderation/warns/Add.subcommand";
import ClearCommand from "../subcommands/moderation/warns/Clear.subcommand";
import RemoveSubCommand from "../subcommands/moderation/warns/Remove.subcommand";

export default class WarnsCommand extends Command {
	public constructor() {
		super("warns", {
			category: "Moderation",
			description: "Either add, remove or clears all warns for a member.",
			examples: [
				"warn add @tncz",
				"warn add @tncz Being toxic",
				"warn remove kzyNZqzBMrQt22SjCe",
				"warn remove kzyNZqzBMrQt22SjCe Unjustified",
				"warn view kzyNZqzBMrQt22SjCe"
			], // Note: create usage and examples for subcommands
			permissions: {
				user: ["ModerateMembers"]
			},
			subcommands: [
				new AddSubCommand(),
				new ClearCommand(),
				new RemoveSubCommand()
			],
			usage: "warn add | remove | view"
		});
	}
}
