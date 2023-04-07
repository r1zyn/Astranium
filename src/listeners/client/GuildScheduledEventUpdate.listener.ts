import { AstraniumClient } from "@lib/Client";
import { Constants } from "@core/constants";
import type { Event } from "@prisma/client";
import type {
	GuildScheduledEvent,
	WebhookMessageCreateOptions
} from "discord.js";
import { Listener } from "@lib/Listener";

export default class GuildScheduledEventUpdateListener extends Listener {
	public constructor() {
		super("guildScheduledEventUpdate", {
			category: "client",
			emitter: "client",
			once: false
		});
	}

	public async exec(
		client: AstraniumClient,
		oldEvent: GuildScheduledEvent,
		newEvent: GuildScheduledEvent
	): Promise<void> {
		if (!oldEvent.guild || !newEvent.guild) return;

		const event: Event | null = await client.db.event.findUnique({
			where: { eventId: newEvent.id }
		});
		if (!event) return;

		const data: WebhookMessageCreateOptions = await client.util.eventData(
			newEvent,
			newEvent.guild
		);
		await Constants.Webhooks["events"].editMessage(event.messageId, data);

		if (newEvent.isCanceled() || newEvent.isCompleted()) {
			await client.db.event.delete({ where: { eventId: newEvent.id } });
		}
	}
}
