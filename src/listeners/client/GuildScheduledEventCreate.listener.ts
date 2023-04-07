import type {
	APIMessage,
	GuildScheduledEvent,
	WebhookMessageCreateOptions
} from "discord.js";
import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import { Listener } from "@lib/Listener";

export default class GuildScheduledEventCreateListener extends Listener {
	public constructor() {
		super("guildScheduledEventCreate", {
			category: "client",
			emitter: "client",
			once: false
		});
	}

	public async exec(
		client: AstraniumClient,
		event: GuildScheduledEvent
	): Promise<void> {
		if (!event.guild) return;

		const data: WebhookMessageCreateOptions = await client.util.eventData(
			event,
			event.guild
		);
		const message: APIMessage = await Constants.Webhooks["events"].send(
			data
		);

		await client.db.event.create({
			data: {
				eventId: event.id,
				messageId: message.id
			}
		});
	}
}
