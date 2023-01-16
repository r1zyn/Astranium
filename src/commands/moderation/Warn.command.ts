import { Command } from "../../lib/Command";

import AddCommand from "../subcommands/moderation/Add.subcommand";
import RemoveCommand from "../subcommands/moderation/Remove.subcommand";
import ViewCommand from "../subcommands/moderation/View.subcommand";

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
            ],
            ownerOnly: false,
            permissions: {
                user: ["ModerateMembers"]
            },
            subcommands: [
                new AddCommand(),
                new RemoveCommand(),
                new ViewCommand()
            ],
            usage: "warn add | remove | view"
        });
    }
}
