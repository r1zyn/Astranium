import { Listener } from "../../lib/Listener";

import { globalLogger } from "../../utils";

export default class UncaughtExceptionListener extends Listener {
    public constructor() {
        super("uncaughtException", {
            category: "process",
            emitter: "process",
            once: false
        });
    }

    public async exec(
        _process: NodeJS.Process,
        error: Error,
        origin: NodeJS.UncaughtExceptionOrigin
    ): Promise<void> {
        return globalLogger.error(
            `Uncaught exception: ${error.stack}\nOrigin: ${origin}`,
            "process",
            true
        );
    }
}
