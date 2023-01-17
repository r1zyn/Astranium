import { Command } from "../../lib/Command";

import AddSubCommand from "../subcommands/moderation/warn/Add.subcommand";
import RemoveSubCommand from "../subcommands/moderation/warn/Remove.subcommand";
import ViewSubCommand from "../subcommands/moderation/warn/View.subcommand";

export default class WarnCommand extends Command {
    public constructor() {
        super("warn", {
            category: "Moderation",
            description: "Either add, remove or view a warn case of a member.",
            examples: [
                "warn add @tncz",
                "warn add @tncz Being toxic",
                "warn remove kzyNZqzBMrQt22SjCe",
                "warn remove kzyNZqzBMrQt22SjCe Unjustified",
                "warn view kzyNZqzBMrQt22SjCe"
            ], // Note: create usage and examples for subcommands
            ownerOnly: false,
            permissions: {
                user: ["ModerateMembers"]
            },
            subcommands: [
                new AddSubCommand(),
                new RemoveSubCommand(),
                new ViewSubCommand()
            ],
            usage: "warn add | remove | view"
        });
    }
}
