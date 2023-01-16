import { AstraniumClient } from "../../lib/Client";
import { Listener } from "../../lib/Listener";

export default class WarnListener extends Listener {
    public constructor() {
        super("warn", {
            category: "client",
            emitter: "client",
            once: false
        });
    }

    public async exec(client: AstraniumClient, message: string): Promise<void> {
        return client.logger.warn(message, "client");
    }
}
