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

    public static caseType(type: string): string {
        return type
            .replaceAll("_", " ")
            .split(" ")
            .map(
                (word: string) =>
                    word[0] + word.substring(1, word.length).toLowerCase()
            )
            .join(" ");
    }

    public static commandMention(
        name: string,
        id: string
    ): `</${string}:${string}>` {
        return `</${name}:${id}>`;
    }

    public static day(day: number): string {
        return [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ][day];
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

    public static month(month: number): string {
        return [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ][month];
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
