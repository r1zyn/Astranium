import { Listener } from "../../lib/Listener";

export default class WarningListener extends Listener {
	public constructor() {
		super("warning", {
			category: "process",
			emitter: "process",
			once: false
		});
	}

	public async exec(_process: NodeJS.Process, warning: Error): Promise<void> {
		return global.logger.warn(`${warning.stack}`, "process");
	}
}
