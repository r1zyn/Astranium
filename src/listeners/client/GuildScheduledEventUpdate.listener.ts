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

        const webhook: WebhookClient = new WebhookClient({
            url: process.env.EVENTS_WEBHOOK
        });

        const startDate: Date | null = newEvent.scheduledStartTimestamp
            ? new Date(newEvent.scheduledStartTimestamp)
            : null;

        const eventDate = (): string => {
            if (newEvent.isActive()) return "Happening now";
            if (newEvent.isCanceled()) return "Cancelled";
            if (newEvent.isCompleted()) return "Ended";
            if (newEvent.isScheduled() && startDate) {
                return `${client.formatter.day(
                    startDate.getDay()
                )} ${client.formatter.month(
                    startDate.getMonth()
                )} ${startDate.getDate()}${client.formatter.suffix(
                    startDate.getDate()
                )} ${startDate
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${startDate
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}`;
            }

            return "";
        };

        const embed: EmbedBuilder = client.util.embed({
            author: {
                name: eventDate(),
                iconURL:
                    (await newEvent.guild.fetchWebhooks())
                        .find((w: Webhook): boolean => w.url === webhook.url)
                        ?.avatarURL() ?? undefined,
                url: newEvent.url
            },
            title: newEvent.name,
            url: newEvent.url,
            description: newEvent.description ?? undefined
        });

        embed.setThumbnail(newEvent.coverImageURL());

        const event: Event | null = await client.db.event.findUnique({
            where: { eventId: newEvent.id }
        });
        if (!event) return;

        const userCount: number = (await newEvent.fetchSubscribers()).size;

        await webhook.editMessage(event.messageId, {
            content: `${client.formatter.roleMention(
                Constants.Roles["event_ping"]
            )} ${
                newEvent.creator
            } created a new event! ${userCount} people are currently interested in this event.`,
            embeds: [embed]
        });

        if (newEvent.isCanceled() || newEvent.isCompleted())
            await client.db.event.delete({ where: { eventId: newEvent.id } });
    }
}
