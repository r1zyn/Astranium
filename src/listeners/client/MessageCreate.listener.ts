import { AstraniumClient } from "../../lib/Client";
import { Constants } from "../../constants";
import { Message } from "discord.js";
import { Listener } from "../../lib/Listener";

import fetch, { Response } from "node-fetch";

export default class MessageCreateListener extends Listener {
    public constructor() {
        super("messageCreate", {
            category: "client",
            emitter: "client",
            once: false
        });
    }

    public async exec(
        _client: AstraniumClient,
        message: Message
    ): Promise<void> {
        if (message.partial) await message.fetch();

        if (message.guild) {
            if (
                message.channelId === Constants.Channels["chatbot"] &&
                !message.author.bot
            ) {
                await fetch(
                    `http://api.brainshop.ai/get?bid=${process.env.BID}&key=${
                        process.env.BRAINSHOP_API_KEY
                    }&uid=${message.author.id}&msg=${encodeURIComponent(
                        message.content
                    )}`
                )
                    .then((res: Response): Promise<any> => res.json())
                    .then(
                        (json: any): Promise<Message> => message.reply(json.cnt)
                    )
                    .catch((): null => null);
            }
        }
    }
}
