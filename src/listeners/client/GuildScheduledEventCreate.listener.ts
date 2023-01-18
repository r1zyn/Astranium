import { AstraniumClient } from "../../lib/Client";
import {
    APIMessage,
    EmbedBuilder,
    GuildScheduledEvent,
    Webhook,
    WebhookClient
} from "discord.js";
import { Constants } from "../../constants";
import { Listener } from "../../lib/Listener";

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

        const webhook: WebhookClient = new WebhookClient({
            url: process.env.EVENTS_WEBHOOK
        });

        const startDate: Date | null = event.scheduledStartTimestamp
            ? new Date(event.scheduledStartTimestamp)
            : null;

        const eventDate = (): string => {
            if (event.isActive()) return "Happening now";
            if (event.isCanceled()) return "Cancelled";
            if (event.isCompleted()) return "Ended";
            if (event.isScheduled() && startDate) {
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
                    (await event.guild.fetchWebhooks())
                        .find((w: Webhook): boolean => w.url === webhook.url)
                        ?.avatarURL() ?? undefined,
                url: event.url
            },
            title: event.name,
            url: event.url,
            description: event.description ?? undefined
        });

        embed.setThumbnail(event.coverImageURL());

        const userCount: number = (await event.fetchSubscribers()).size;

        const message: APIMessage = await webhook.send({
            content: `${client.formatter.roleMention(
                Constants.Roles["event_ping"]
            )} ${
                event.creator
            } created a new event! ${userCount} people are currently interested in this event.`,
            embeds: [embed]
        });

        await client.db.event.create({
            data: {
                eventId: event.id,
                messageId: message.id
            }
        });
    }
}
