import type { AstraniumConfig } from "../lib/Client";

import { arch, hostname, platform, userInfo } from "os";
import { join } from "path";
import { reviewConfig } from "./reviewConfig";

export function initProcess(config: AstraniumConfig): void {
	reviewConfig(config);

	global.logger.info(
		`Starting Launcher on ${hostname()} with PID ${process.pid}`,
		"launcher"
	);
	global.logger.info(
		`${join(process.cwd(), "src", "index.ts")} started by ${
			userInfo().username
		}`,
		"client"
	);
	console.log(`\t\t\t\t\t\t\t\t        in ${join(process.cwd(), "src")}`);
	global.logger.info(
		`Operating System: ${platform()} | Architecture: ${arch()}`,
		"system"
	);
	global.logger.info(
		`Initiating process for ${config.name} on current instance`,
		"launcher"
	);
	global.logger.info(
		`Using version ${
			config.version
		} on ${config.release.toLowerCase()} release`,
		"launcher"
	);
}
