import type { AstraniumClient } from "../../lib/Client";
import { Listener } from "../../lib/Listener";

export default class ErrorListener extends Listener {
	public constructor() {
		super("error", {
			category: "client",
			emitter: "client",
			once: false
		});
	}

	public async exec(client: AstraniumClient, error: Error): Promise<void> {
		return client.logger.error(error, "client");
	}
}
