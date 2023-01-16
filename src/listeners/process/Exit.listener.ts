import { Constants } from "../../constants";
import { Listener } from "../../lib/Listener";

import { globalLogger } from "../../utils";

export default class ExitListener extends Listener {
    public constructor() {
        super("exit", {
            category: "process",
            emitter: "process",
            once: false
        });
    }

    public async exec(_process: NodeJS.Process, code: number): Promise<void> {
        await Constants.Prisma.$disconnect();

        globalLogger.info(
            `Exiting with code ${code} (${Constants.ProcessExitCodes[code]})`,
            "process"
        );
    }
}
