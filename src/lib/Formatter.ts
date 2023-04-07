import { Constants } from "@core/constants";
import { ClientPlatform, MemberAcknowledgements } from "@typings/main";
import {
	GuildMember,
	PermissionsString,
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
	roleMention,
	Collection,
	Role,
	ActivityType,
	Activity,
	PresenceStatus
} from "discord.js";

import timestring from "timestring";

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

	public static difference: (a: Date, b: Date) => string | undefined = (
		a: Date,
		b: Date
	): string | undefined => this.formatTime(b.getTime() - a.getTime());

	public static formatTime(ms: number): string | undefined {
		const seconds: string = Math.floor((ms / 1000) % 60).toString();
		const minutes: string = Math.floor((ms / (1000 * 60)) % 60).toString();
		const hours: string = Math.floor(
			(ms / (1000 * 60 * 60)) % 60
		).toString();
		const days: string = Math.floor(
			(ms / (1000 * 60 * 60 * 24)) % 60
		).toString();

		if (hours === "0") {
			return `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
		} else if (days === "0") {
			return `${hours.padStart(2, "0")}:${minutes.padStart(
				2,
				"0"
			)}:${seconds.padStart(2, "0")}`;
		} else if (days.length < 2) {
			return `${days.padStart(1, "0")}:${hours.padStart(
				2,
				"0"
			)}:${minutes.padStart(2, "0")}`;
		} else if (days.length >= 2) {
			return `${days.padStart(2, "0")}:${hours.padStart(
				2,
				"0"
			)}:${minutes.padStart(2, "0")}`;
		}
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
	): string =>
		permission
			.replace(/[A-Z]/g, " $&")
			.trim()
			.replace("V A D", "VAD")
			.replace("T T S", "TTS");

	public static permissions: (permissions: PermissionsString[]) => string[] =
		(permissions: PermissionsString[]): string[] =>
			permissions.map((permission: PermissionsString): string =>
				this.permission(permission)
			);

	public static roles: (
		roles: Collection<string, Role>,
		limit: number
	) => string = (roles: Collection<string, Role>, limit: number): string =>
		`${
			roles.size > limit
				? `${roles
						.map((role: Role): Role => role)
						.sort(
							(role1: Role, role2: Role): number =>
								role2.position - role1.position
						)
						.slice(0, limit + 1)
						.join(" ")} +${roles.size - limit} more...`
				: roles
						.map((role: Role): Role => role)
						.sort(
							(role1: Role, role2: Role) =>
								role2.position - role1.position
						)
						.join(" ")
		}`;

	public static userAcknowledgements(member: GuildMember): string[] {
		const acknowledgements: MemberAcknowledgements[] = [];

		if (member.id === member.guild.ownerId) {
			acknowledgements.push("Server Owner");
		}
		if (member.permissions.has("Administrator")) {
			acknowledgements.push("Administrator");
		}
		if (member.roles.cache.has(Constants["Roles"].staff)) {
			acknowledgements.push("Staff Member");
		}
		if (member.premiumSince) acknowledgements.push("Server Booster");
		if (acknowledgements.length === 0) acknowledgements.push("None");

		return acknowledgements.map(
			(acknowledgement: MemberAcknowledgements): string =>
				`• ${acknowledgement}`
		);
	}

	public static userActivity(member: GuildMember): string {
		let status: string = "None";

		if (
			member.presence &&
			member.presence.activities &&
			member.presence.activities[0]
		) {
			const customStatus: Activity | undefined =
				member.presence.activities.find(
					(activity: Activity): boolean =>
						activity.type === ActivityType.Custom
				);

			if (customStatus && customStatus.state) {
				status = customStatus.state;
			} else {
				status = `${
					Constants.ActivityType[member.presence.activities[0].type]
				} ${member.presence.activities[0].name}`;
			}
		}

		return status;
	}

	public static userAvatars: (member: GuildMember) => string[] = (
		member: GuildMember
	): string[] => [
		member.user.displayAvatarURL({ extension: "png" }),
		member.user.displayAvatarURL({ extension: "webp" }),
		member.user.displayAvatarURL({ extension: "gif" }),
		member.user.displayAvatarURL({ extension: "jpg" }),
		member.user.displayAvatarURL({ extension: "jpeg" })
	];

	public static userFlags(member: GuildMember): string {
		if (member.user.flags) {
			const flags: string[] = [];

			member.user.flags
				.toArray()
				.forEach((flag: string): number =>
					flags.push(Constants.UserFlags[flag])
				);

			return flags.join("n");
		} else {
			return "• None";
		}
	}

	public static userPlatform(member: GuildMember): ClientPlatform | null {
		let platform: ClientPlatform;

		if (
			member.presence &&
			member.presence.status !== ("invisible" || "offline") &&
			member.presence.clientStatus
		) {
			if (member.presence.clientStatus.desktop) platform = "Desktop";
			else if (member.presence.clientStatus.mobile) platform = "Mobile";
			else if (member.presence.clientStatus.web) platform = "Browser";
			else return null;
		} else {
			return null;
		}

		return platform;
	}

	public static userStatus(status: PresenceStatus): string {
		return status
			.toString()
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

	public static timestring(
		input: string,
		returnUnit?: timestring.ReturnUnit | undefined,
		opts?: timestring.Options | undefined
	): number | null {
		try {
			return timestring(input, returnUnit, opts);
		} catch (_) {
			return null;
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
