import type { AstraniumConfig } from "../lib/Client";

export function reviewConfig(config: AstraniumConfig): void {
	global.logger.info(
		"Reviewing configuration, this will only take a moment...",
		"config"
	);

	if (typeof config !== "object") {
		return global.logger.error(
			"An invalid configuration was provided (not an object)",
			"config",
			true
		);
	}

	const options: { key: string; type: string }[] = [
		{ key: "clientID", type: "string" },
		{ key: "clientOptions", type: "object" },
		{ key: "guildID", type: "string" },
		{ key: "name", type: "string" },
		{ key: "owners", type: "object" },
		{ key: "release", type: "string" },
		{ key: "token", type: "string" },
		{ key: "version", type: "string" }
	];

	options.forEach((option: { key: string; type: string }): void => {
		if (!(option.key in config)) {
			return global.logger.error(
				`Configuration is missing "${option.key}" option`,
				"config",
				true
			);
		} else if (typeof config[option.key] !== option.type) {
			return global.logger.error(
				`Invalid value provided for "${option.key}" option (expected: ${
					option.type
				}, received: ${typeof config[option.key]})`,
				"config",
				true
			);
		}
	});

	["intents", "partials"].forEach((option: string): void => {
		if (!(option in config.clientOptions)) {
			return global.logger.error(
				`Configuration "clientOptions" option is missing ${option} option`,
				"config",
				true
			);
		}
	});

	["clientID", "guildID"].forEach((option: string): void => {
		if (!config[option].match(/\d{18}/g)) {
			return global.logger.error(
				`Configuration "${option}" option value is invalid snowflake`,
				"config",
				true
			);
		}
	});

	config.owners.forEach((snowflake: string): void => {
		if (!snowflake.match(/\d{18}/g)) {
			return global.logger.error(
				`Configuration owner ID "${snowflake}" is invalid snowflake`,
				"config",
				true
			);
		}
	});

	if (!config.token.match(/[A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/g)) {
		return global.logger.error(
			"Invalid bot token provided in configuration",
			"config",
			true
		);
	}
}
