import { Listener } from "../../lib/Listener";

import { globalLogger } from "../../utils";

export default class WarningListener extends Listener {
    public constructor() {
        super("warning", {
            category: "process",
            emitter: "process",
            once: false
        });
    }

    public async exec(_process: NodeJS.Process, warning: Error): Promise<void> {
        return globalLogger.warn(`${warning.stack}`, "process");
    }
}
