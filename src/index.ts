import { AstraniumClient } from "./lib/Client";
import { Logger } from "./lib/Logger";

import { initProcess } from "./scripts/initProcess";

import config from "../astranium.config";

global.logger = new Logger();

new Promise((resolve: (value: unknown) => void): void => {
    resolve(initProcess(config));
})
    .then((): void => {
        const client: AstraniumClient = new AstraniumClient(config);
        client.start();
    })
    .catch((error: Error): void => global.logger.error(error, "process", true));
