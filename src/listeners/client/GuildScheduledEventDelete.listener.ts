import { AstraniumClient } from "../../lib/Client";
import { Constants } from "../../constants";
import {
    EmbedBuilder,
    GuildScheduledEvent,
    Webhook,
    WebhookClient
} from "discord.js";
import type { Event } from "@prisma/client";
import { Listener } from "../../lib/Listener";

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

        const webhook: WebhookClient = new WebhookClient({
            url: process.env.EVENTS_WEBHOOK
        });

        const embed: EmbedBuilder = client.util.embed({
            author: {
                name: "Cancelled",
                iconURL:
                    (await deletedEvent.guild.fetchWebhooks())
                        .find((w: Webhook): boolean => w.url === webhook.url)
                        ?.avatarURL() ?? undefined,
                url: deletedEvent.url
            },
            title: deletedEvent.name,
            url: deletedEvent.url,
            description: deletedEvent.description ?? undefined
        });

        embed.setThumbnail(deletedEvent.coverImageURL());

        const event: Event | null = await client.db.event.findUnique({
            where: { eventId: deletedEvent.id }
        });
        if (!event) return;

        const userCount: number = (await deletedEvent.fetchSubscribers()).size;

        await webhook.editMessage(event.messageId, {
            content: `${client.formatter.roleMention(
                Constants.Roles["event_ping"]
            )} ${
                deletedEvent.creator
            } created a new event! ${userCount} people are currently interested in this event.`,
            embeds: [embed]
        });

        await client.db.event.delete({ where: { eventId: deletedEvent.id } });
    }
}
