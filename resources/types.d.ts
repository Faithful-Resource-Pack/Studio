// even though this project doesn't use typescript, this still adds intellisense in JS templates
// https://v2.vuejs.org/v2/guide/typescript.html#Augmenting-Types-for-Use-with-Plugins

import Vue from "vue";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { RouteConfig } from "vue-router";
import { DateTimeFormatOptions } from "luxon";

import authStore from "../stores/authStore.js";
import translationStore from "../stores/translationStore.js";
import themeStore from "../stores/themeStore.js";
import strings from "./strings/en_US.js";

// Vue has the constructor type in types/vue.d.ts
declare module "vue/types/vue" {
	interface DiscordUser {
		access_token: string;

		id: string;
		discordUsername: string;
		avatar: string;
		banner: string;

		username: string;
		uuid: string;
		roles: string[];
		anonymous: boolean;
	}

	type SnackBarCallback = (
		message: string | AxiosResponse,
		color?: string, // can be vuetify color also
		timeout?: number,
		json?: unknown, // any json-encodable object
	) => void;

	// add public method/getter types
	interface Vue {
		readonly auth: ReturnType<typeof authStore>;
		readonly translation: ReturnType<typeof translationStore>;
		readonly theme: ReturnType<typeof themeStore>;
		readonly loginURL: string;
		readonly apiURL: string;
		readonly apiOptions: AxiosRequestConfig;
		readonly user: DiscordUser;
		readonly isLoggedIn: boolean;
		readonly isAdmin: boolean;

		log(...objs: any[]): void;
		lang(): Readonly<typeof strings>;
		lang(key: string, raw?: false): string;
		lang(key: string, raw: true): any;
		makeJsonSnackBar(json: unknown): SnackBarCallback;
		showSnackBar: SnackBarCallback;
		wrapSnackBar<T>(prom: T | Awaited<T>, successMessage?: string): Promise<Awaited<T>>;
		compileMarkdown(rawText: string): string;
		formatDate(date: number | string | Date, format?: DateTimeFormatOptions): string;
		reloadSettings(): Promise<void>;

		// there's more methods but none of them are used publicly
	}
}

// add global methods
declare global {
	declare const settings: Record<string, any>;
	declare const apiURL: string;

	interface Window {
		readonly settings: typeof settings;
		readonly apiURL: typeof apiURL;
	}

	interface Array {
		/** Convert an array into a formatted string list */
		listify(): string;
	}

	interface String {
		/** Converts all words in a string to title case. */
		toTitleCase(): string;
	}

	interface StringConstructor {
		readonly urlRegex: RegExp;
	}

	interface ObjectConstructor {
		isObject(arg: any): arg is Object;
		/** Deep merge two objects (used for lang) */
		merge(target: Object, ...sources: Object[]): Object;
		/** Check if two objects are exactly equal */
		equals(x: Object, y: Object): boolean;
	}
}

interface SidebarTab {
	id: string;
	subtabs: SidebarSubtab[];
	// defaults to all public
	roles?: string[];
}

interface SidebarSubtab {
	id: string;
	icon: string;
	// not included when false
	public?: true;
	disabled?: true;
	routes: (RouteConfig & { cleanPath?: string })[];
	// takes a vue instance and returns what to display in the badge
	// not done with `this` binding so arrow functions can be used
	badge?: (app: Vue) => any;
	roles?: string[];
}

interface LangMetadata {
	id: string;
	display: string;
	// automatically fetch default import
	load: () => Readonly<Partial<typeof strings>>;
	bcp47: string;
	file: string;
	iso3166: string;
}
