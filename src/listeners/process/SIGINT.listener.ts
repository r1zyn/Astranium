import { Constants } from "@core/constants";
import { Listener } from "@lib/Listener";

export default class SIGINTListener extends Listener {
	public constructor() {
		super("SIGINT", {
			category: "process",
			emitter: "process",
			once: false
		});
	}

	public async exec(_process: NodeJS.Process, signal: string): Promise<void> {
		const code: number | undefined = process.exitCode;
		await global.prisma.$disconnect();

		code
			? global.logger.info(
					`Exiting with code ${code} (${Constants.ProcessExitCodes[code]})`,
					"process"
			  )
			: global.logger.info(`Exiting process (${signal})`, "process");
	}
}
