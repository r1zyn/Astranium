import { AstraniumClient } from "./Client";
import { Category } from "./Category";
import { Collection } from "discord.js";
import { EventEmitter } from "node:events";
import { Listener } from "./Listener";

import { existsSync, readdirSync, statSync } from "fs";

export class ListenerHandler {
    public categories: Collection<string, Category<Listener>>;
    private client: AstraniumClient;
    public listeners: Collection<string, Listener>;
    public options: ListenerHandlerOptions;

    public constructor(
        client: AstraniumClient,
        options: ListenerHandlerOptions
    ) {
        this.categories = new Collection<string, Category<Listener>>();
        this.client = client;
        this.listeners = new Collection<string, Listener>();
        this.options = options;
    }

    public async init(): Promise<void> {
        await this.loadListeners();
    }

    public listen(listener: Listener): void {
        switch (listener.emitter) {
            case "client":
                if (listener.once) {
                    this.client.once(
                        listener.name.toString(),
                        listener.exec.bind(null, this.client)
                    );
                } else {
                    this.client.on(
                        listener.name.toString(),
                        listener.exec.bind(null, this.client)
                    );
                }

                break;
            case "process":
                if (listener.once) {
                    process.once(
                        listener.name,
                        listener.exec.bind(null, process)
                    );
                } else {
                    process.on(
                        listener.name,
                        listener.exec.bind(null, process)
                    );
                }

                break;
        }
    }

    public listenTo<Emitter extends EventEmitter>(
        event: string,
        emitter: Emitter,
        callback: (...args: any[]) => any,
        once: boolean = false
    ): void {
        if (once) emitter.once(event, callback);
        else emitter.on(event, callback);
    }

    public async loadListeners(): Promise<void> {
        if (!existsSync(this.options.directory)) {
            return this.client.logger.error(
                `The specified listener directory "${this.options.directory}" does not exist`,
                "listenerHandler",
                true
            );
        }
        if (!statSync(this.options.directory).isDirectory()) {
            return this.client.logger.error(
                `The specified listener directory "${this.options.directory}" is invalid`,
                "listenerHandler",
                true
            );
        }

        try {
            for (const subdirectory of readdirSync(
                this.options.directory
            ).filter((subdirectory: string): boolean =>
                statSync(
                    `${this.options.directory}/${subdirectory}`
                ).isDirectory()
            )) {
                for (const file of readdirSync(
                    `${this.options.directory}/${subdirectory}`
                ).filter((file: string): boolean =>
                    file.endsWith(".listener.js")
                )) {
                    const Instance: new () => Listener = (
                        (await import(
                            `${this.options.directory}/${subdirectory}/${file}`
                        )) as { default: new () => Listener }
                    ).default;
                    if (!Instance) {
                        return this.client.logger.error(
                            `Default export of ${this.options.directory}/${subdirectory}/${file} is not instance of Listener class`,
                            "listenerHandler",
                            true
                        );
                    }

                    const isListener: boolean =
                        Instance.prototype instanceof Listener;
                    if (!isListener) {
                        return this.client.logger.error(
                            `Default export of ${this.options.directory}/${subdirectory}/${file} is not instance of Listener class`,
                            "listenerHandler",
                            true
                        );
                    }

                    const listener: Listener = new Instance();
                    listener.exec = Instance.prototype.exec;

                    if (!this.categories.get(listener.category.toLowerCase())) {
                        this.categories.set(
                            listener.category.toLowerCase(),
                            new Category<Listener>(
                                listener.category.toLowerCase(),
                                {
                                    data: new Collection<string, Listener>(),
                                    name: listener.category.toLowerCase()
                                }
                            )
                        );
                    }

                    const category: Category<Listener> | undefined =
                        this.categories.get(listener.category.toLowerCase());
                    category && category.data.set(listener.name, listener);

                    this.listeners.set(listener.name, listener);
                    this.listen(listener);
                }
            }

            for (const file of readdirSync(this.options.directory)
                .filter((subfile: string): boolean =>
                    statSync(`${this.options.directory}/${subfile}`).isFile()
                )
                .filter((file: string): boolean =>
                    file.endsWith(".listener.js")
                )) {
                const Instance: new () => Listener = (
                    (await import(`${this.options.directory}/${file}`)) as {
                        default: new () => Listener;
                    }
                ).default;
                if (!Instance) {
                    return this.client.logger.error(
                        `Default export of ${this.options.directory}/${file} is not instance of Listener class`,
                        "listenerHandler",
                        true
                    );
                }

                const isListener: boolean =
                    Instance.prototype instanceof Listener;
                if (!isListener) {
                    return this.client.logger.error(
                        `Default export of ${this.options.directory}/${file} is not instance of Listener class`,
                        "listenerHandler",
                        true
                    );
                }

                const listener: Listener = new Instance();
                listener.exec = Instance.prototype.exec;

                if (!this.categories.get(listener.category.toLowerCase())) {
                    this.categories.set(
                        listener.category.toLowerCase(),
                        new Category<Listener>(
                            listener.category.toLowerCase(),
                            {
                                data: new Collection<string, Listener>(),
                                name: listener.category.toLowerCase()
                            }
                        )
                    );
                }

                const category: Category<Listener> | undefined =
                    this.categories.get(listener.category.toLowerCase());
                category && category.data.set(listener.name, listener);

                this.listeners.set(listener.name, listener);
                this.listen(listener);
            }

            if (this.listeners.size === 0) {
                this.client.logger.warn(
                    "No listeners were loaded from listener directory",
                    "listenerHandler"
                );
            }

            this.client.logger.info(
                `Successfully loaded ${this.listeners.size} listener(s) from listener directory`,
                "listenerHandler"
            );
            this.client.logger.info(
                `Successfully loaded ${this.categories.size} listener categories`,
                "listenerHandler"
            );
        } catch (error) {
            this.client.logger.error(error.stack, "listenerHandler", true);
        }
    }
}

export interface ListenerHandlerOptions {
    directory: string;
}
