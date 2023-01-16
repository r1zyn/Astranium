import { Listener } from "../../lib/Listener";

import { globalLogger } from "../../utils";

export default class UnhandledRejectionListener extends Listener {
    public constructor() {
        super("unhandledRejection", {
            category: "process",
            emitter: "process",
            once: false
        });
    }

    public async exec(_process: NodeJS.Process, error: Error): Promise<void> {
        return globalLogger.error(
            `Unhandled rejection: ${error.stack}`,
            "process"
        );
    }
}
