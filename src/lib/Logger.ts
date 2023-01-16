import chalk from "chalk";

export class Logger {
    public info(message: any, emitter: string): void {
        console.log(
            `${chalk.green(
                new Date().toLocaleDateString().replaceAll("/", "-")
            )} ${chalk.green(
                new Date()
                    .toLocaleTimeString()
                    .replace("am", "AM")
                    .replace("pm", "PM")
            )}  ${chalk.blue("INFO")}    --- [main] ${chalk.blueBright(
                "astranium." + emitter
            )}${"\u0020".repeat(
                27 - ("astranium." + emitter).length + 1
            )}: ${message}`
        );
    }

    public ready(message: any, emitter: string): void {
        console.log(
            `${chalk.green(
                new Date().toLocaleDateString().replaceAll("/", "-")
            )} ${chalk.green(
                new Date()
                    .toLocaleTimeString()
                    .replace("am", "AM")
                    .replace("pm", "PM")
            )}  ${chalk.green("READY")}   --- [main] ${chalk.blueBright(
                "astranium." + emitter
            )}${"\u0020".repeat(
                27 - ("astranium." + emitter).length + 1
            )}: ${message}`
        );
    }

    public warn(warning: any, emitter: string): void {
        console.log(
            `${chalk.green(
                new Date().toLocaleDateString().replaceAll("/", "-")
            )} ${chalk.green(
                new Date()
                    .toLocaleTimeString()
                    .replace("am", "AM")
                    .replace("pm", "PM")
            )}  ${chalk.yellow("WARN")}    --- [main] ${chalk.blueBright(
                "astranium." + emitter
            )}${"\u0020".repeat(
                27 - ("astranium." + emitter).length + 1
            )}: ${warning}`
        );
    }

    public error(
        error: Error | string,
        emitter: string,
        kill: boolean = false
    ): void {
        console.log(
            `${chalk.green(
                new Date().toLocaleDateString().replaceAll("/", "-")
            )} ${chalk.green(
                new Date()
                    .toLocaleTimeString()
                    .replace("am", "AM")
                    .replace("pm", "PM")
            )}  ${chalk.red("ERROR")}   --- [main] ${chalk.blueBright(
                "astranium." + emitter
            )}${"\u0020".repeat(27 - ("astranium." + emitter).length + 1)}: ${
                typeof error === "string" ? error : error.stack ?? error.message
            }`
        );
        if (kill) process.exit(1);
    }
}
