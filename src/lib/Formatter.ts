import {
    GuildMember,
    PermissionsString,
    PresenceStatus,
    bold,
    italic,
    strikethrough,
    underscore,
    spoiler,
    quote,
    blockQuote,
    hyperlink,
    hideLinkEmbed,
    inlineCode,
    codeBlock,
    time,
    userMention,
    channelMention,
    roleMention
} from "discord.js";

export class Formatter {
    public static capitalize([first, ...rest]: string): string {
        return first === undefined
            ? ""
            : first.toLocaleUpperCase() + rest.join("");
    }

    public static commandMention(
        name: string,
        id: string
    ): `</${string}:${string}>` {
        return `</${name}:${id}>`;
    }

    public static missingPermissions(
        member: GuildMember,
        permissions: PermissionsString[]
    ): string {
        return member.permissions
            .missing(permissions)
            .map((permission: PermissionsString): string =>
                this.inlineCode(this.permission(permission))
            )
            .join(", ");
    }

    public static permission: (permission: PermissionsString) => string = (
        permission: PermissionsString
    ) => permission.replace(/[A-Z]/g, " $&").trim().replace("V A D", "VAD");

    public static status(status: PresenceStatus): string {
        return status
            .replace("online", "Online")
            .replace("idle", "Idle")
            .replace("dnd", "Do Not Disturb")
            .replace("offline", "Offline")
            .replace("invisible", "Invisible");
    }

    public static suffix(number: number): "th" | "st" | "nd" | "rd" {
        if (number > 3 && number < 21) return "th";
        switch (number % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }

    public static bold = bold;
    public static italic = italic;
    public static strikethrough = strikethrough;
    public static underscore = underscore;
    public static spoiler = spoiler;
    public static quote = quote;
    public static blockQuote = blockQuote;
    public static hyperlink = hyperlink;
    public static hideLinkEmbed = hideLinkEmbed;
    public static inlineCode = inlineCode;
    public static codeBlock = codeBlock;
    public static languageCodeBlock = (
        language: string,
        content: string
    ): `\`\`\`${string}\n${string}\n\`\`\`` => codeBlock(language, content);
    public static time = time;
    public static userMention = userMention;
    public static channelMention = channelMention;
    public static roleMention = roleMention;
}
