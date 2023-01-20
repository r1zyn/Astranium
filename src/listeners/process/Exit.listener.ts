import { Constants } from "../../constants";
import { Listener } from "../../lib/Listener";

export default class ExitListener extends Listener {
	public constructor() {
		super("exit", {
			category: "process",
			emitter: "process",
			once: false
		});
	}

	public async exec(_process: NodeJS.Process, code: number): Promise<void> {
		await global.prisma.$disconnect();

		global.logger.info(
			`Exiting with code ${code} (${Constants.ProcessExitCodes[code]})`,
			"process"
		);
	}
}
