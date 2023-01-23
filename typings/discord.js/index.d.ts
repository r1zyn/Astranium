import type { AstraniumEvents } from "../../src/typings/main";

declare module "discord.js" {
	interface ClientEvents extends AstraniumEvents {}
}
