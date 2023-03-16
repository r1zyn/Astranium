import type { AstraniumEvents } from "@typings/main";
import type { ClientEvents } from "discord.js";

export class Listener {
	public category: string;
	public emitter: ListenerEmitter;
	public name: ListenerName;
	public once: boolean;

	public constructor(name: ListenerName, options: ListenerOptions) {
		this.setCategory(options.category);
		this.setEmitter(options.emitter);
		this.setName(name);
		this.setOnce(options.once ?? false);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async exec(...args: any[]): Promise<any> {
		global.logger.error(
			`Listener class ${this.constructor.name} "exec" method has not been implemented`,
			`${this.constructor.name.replace("Listener", "")}Listener`,
			true
		);

		// await Util.handleListenerFunctions<[...typeof this.exec.arguments], void>(
		// 	this.handlers,
		// 	[...args]
		// )
	}

	public setCategory(category: string): this {
		this.category = category;
		return this;
	}

	public setEmitter(emitter: ListenerEmitter): Listener {
		this.emitter = emitter;
		return this;
	}

	public setName(name: ListenerName): Listener {
		this.name = name;
		return this;
	}

	public setOnce(once: boolean): Listener {
		this.once = once;
		return this;
	}
}

export type ListenerEmitter = "client" | "process";
export type ListenerName =
	| keyof ClientEvents
	| keyof AstraniumEvents
	| ProcessEvents;

export interface ListenerOptions {
	category: string;
	emitter: ListenerEmitter;
	once?: boolean;
}

export type ProcessEvents =
	| "beforeExit"
	| "disconnect"
	| "exit"
	| "message"
	| "rejectionHandled"
	| UncaughtExceptionOrigin
	| "uncaughtExceptionMonitor"
	| "warning"
	| "worker"
	| Signals;

export type Signals =
	| "SIGABRT"
	| "SIGALRM"
	| "SIGBUS"
	| "SIGCHLD"
	| "SIGCONT"
	| "SIGFPE"
	| "SIGHUP"
	| "SIGILL"
	| "SIGINT"
	| "SIGIO"
	| "SIGIOT"
	| "SIGKILL"
	| "SIGPIPE"
	| "SIGPOLL"
	| "SIGPROF"
	| "SIGPWR"
	| "SIGQUIT"
	| "SIGSEGV"
	| "SIGSTKFLT"
	| "SIGSTOP"
	| "SIGSYS"
	| "SIGTERM"
	| "SIGTRAP"
	| "SIGTSTP"
	| "SIGTTIN"
	| "SIGTTOU"
	| "SIGUNUSED"
	| "SIGURG"
	| "SIGUSR1"
	| "SIGUSR2"
	| "SIGVTALRM"
	| "SIGWINCH"
	| "SIGXCPU"
	| "SIGXFSZ"
	| "SIGBREAK"
	| "SIGLOST"
	| "SIGINFO";

export type UncaughtExceptionOrigin =
	| "uncaughtException"
	| "unhandledRejection";
