import type { ClientEvents } from "discord.js";

import { globalLogger } from "../utils";

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

    public async exec(..._args: any[]): Promise<any> {
        globalLogger.error(
            `Listener class ${this.constructor.name} "exec" method has not been implemented`,
            `${this.constructor.name.replace("Listener", "")}Listener`,
            true
        );
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
export type ListenerName = keyof ClientEvents | ProcessEvents;

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
    | "uncaughtException"
    | "uncaughtExceptionMonitor"
    | "unhandledRejection"
    | "warning"
    | "worker";
