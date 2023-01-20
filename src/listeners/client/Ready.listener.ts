import { ActivityType } from "discord.js";
import type { AstraniumClient } from "../../lib/Client";
import { Listener } from "../../lib/Listener";

export default class ReadyListener extends Listener {
	public constructor() {
		super("ready", {
			category: "client",
			emitter: "client",
			once: true
		});
	}

	public async exec(client: AstraniumClient<true>): Promise<void> {
		client.user.setPresence({
			activities: [
				{
					name: "The Astranium",
					type: ActivityType.Watching
				}
			],
			status: "online"
		});

		client.logger.ready(
			`Logged in as ${
				client.user.tag
			} | Status: ${client.formatter.status(
				client.user.presence.status
			)} | Version: v${client.config.version}`,
			"client"
		);
	}
}
