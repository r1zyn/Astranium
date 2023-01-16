import { arch, hostname, platform, userInfo } from "os";
import { globalLogger } from "../utils";
import { join } from "path";
import { reviewConfig } from "./reviewConfig";

export function initProcess(config: any): void {
    reviewConfig(config);

    globalLogger.info(
        `Starting Launcher on ${hostname()} with PID ${process.pid}`,
        "launcher"
    );
    globalLogger.info(
        `${join(process.cwd(), "src", "index.ts")} started by ${
            userInfo().username
        }`,
        "client"
    );
    console.log(`\t\t\t\t\t\t\t\t       in ${join(process.cwd(), "src")}`);
    globalLogger.info(
        `Operating System: ${platform()} | Architecture: ${arch()}`,
        "system"
    );
    globalLogger.info(
        `Initiating process for ${config.name} on current instance`,
        "launcher"
    );
    globalLogger.info(
        `Using version ${
            config.version
        } on ${config.release.toLowerCase()} release`,
        "launcher"
    );
}
