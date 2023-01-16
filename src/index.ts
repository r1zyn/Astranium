import { AstraniumClient } from "./lib/Client";

import { globalLogger } from "./utils";
import { initProcess } from "./scripts/initProcess";

import config from "../astranium.config";

new Promise((resolve: (value: unknown) => void): void => {
    resolve(initProcess(config));
})
    .then((): void => {
        const client: AstraniumClient = new AstraniumClient(config);
        client.start();
    })
    .catch((error: Error): void => globalLogger.error(error, "process", true));
