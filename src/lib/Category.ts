import type { Collection } from "discord.js";

export class Category<T> {
	public data: Collection<string, T>;
	public description: string;
	public name: string;

	public constructor(name: string, options: CategoryOptions<T>) {
		this.data = options.data;
		this.description =
			options.description ||
			"No description has been provided for this category.";
		this.name = name;
	}
}

export interface CategoryOptions<T> {
	data: Collection<string, T>;
	description?: string;
	name: string;
}
