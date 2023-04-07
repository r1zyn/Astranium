import type { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type {
	GuildScheduledEvent,
	WebhookMessageCreateOptions
} from "discord.js";
import type { Event } from "@prisma/client";
import { Listener } from "@lib/Listener";

export default class GuildScheduledEventDeleteListener extends Listener {
	public constructor() {
		super("guildScheduledEventDelete", {
			category: "client",
			emitter: "client",
			once: false
		});
	}

	public async exec(
		client: AstraniumClient,
		deletedEvent: GuildScheduledEvent
	): Promise<void> {
		if (!deletedEvent.guild) return;

		const event: Event | null = await client.db.event.findUnique({
			where: { eventId: deletedEvent.id }
		});
		if (!event) return;

		const data: WebhookMessageCreateOptions = await client.util.eventData(
			deletedEvent,
			deletedEvent.guild
		);

		await Constants.Webhooks["events"].editMessage(event.messageId, data);
		await client.db.event.delete({ where: { eventId: deletedEvent.id } });
	}
}
